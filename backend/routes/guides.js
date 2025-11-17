const express = require('express');
const { v4: uuid } = require('uuid');
const {
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = require('../db/dynamoClient');

const router = express.Router();
const TABLE = process.env.TABLE_NAME;

router.post('/', async (req, res) => {
  try {
    const { gameTitle, title, content, authorId } = req.body;

    const item = {
      guideId: uuid(),
      gameTitle,
      title,
      content,
      authorId,
      approved: false,
      ratingCount: 0,
      ratingSum: 0,
      createdAt: new Date().toISOString()
    };

    await client.send(new PutItemCommand({
      TableName: TABLE,
      Item: marshall(item)
    }));

    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  const params = {
    TableName: TABLE,
    Key: marshall({ guideId: req.params.id })
  };
  const data = await client.send(new GetItemCommand(params));
  if (!data.Item) return res.status(404).json({ error: "Guide not found." });
  res.json(unmarshall(data.Item));
});

router.post('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;

    const params = {
      TableName: TABLE,
      Key: marshall({ guideId: req.params.id }),
      UpdateExpression:
        "SET ratingCount = ratingCount + :one, ratingSum = ratingSum + :r",
      ExpressionAttributeValues: marshall({
        ":one": 1,
        ":r": rating
      }),
      ReturnValues: "ALL_NEW"
    };

    const response = await client.send(new UpdateItemCommand(params));
    res.json(unmarshall(response.Attributes));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id/approve', async (req, res) => {
  try {
    const params = {
      TableName: TABLE,
      Key: marshall({ guideId: req.params.id }),
      UpdateExpression: "SET approved = :t",
      ExpressionAttributeValues: marshall({ ":t": true }),
      ReturnValues: "ALL_NEW"
    };

    const result = await client.send(new UpdateItemCommand(params));
    res.json(unmarshall(result.Attributes));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;