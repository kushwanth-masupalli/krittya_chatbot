require('dotenv').config();
const express = require('express');
const { queryRag } = require('./query');

const app = express();
app.use(express.json());

app.post('/ask', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await queryRag(query);
    
    res.json({ answer: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
