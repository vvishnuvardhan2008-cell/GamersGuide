const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const guides = require('./routes/guides');
const library = require('./routes/library');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/guides', guides);
app.use('/api/library', library);

app.get('/', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on port', PORT));