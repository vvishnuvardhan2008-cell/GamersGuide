const express = require('express');
const { ScanCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = require('../db/dynamoClient');

const router = express.Router();
const TABLE = process.env.TABLE_NAME;

router.get('/search', async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) return res.status(400).json({ error: "Title is required." });

    const params = {
      TableName: TABLE,
      FilterExpression: "contains(gameTitle, :t)",
      ExpressionAttributeValues: marshall({ ":t": title })
    };

    const data = await client.send(new ScanCommand(params));
    const items = data.Items.map(i => unmarshall(i));
    return res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;