require('dotenv').config();
const express = require('express');
const { queryRag } = require('./query');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

// Parse allowed origins from environment variable
const corsOptions = ALLOWED_ORIGINS === '*'
  ? { origin: true }
  : { origin: ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) };

app.use(express.json());
app.use(cors(corsOptions));

app.post('/ask', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (typeof query !== 'string') {
      return res.status(400).json({ error: 'Query must be a string' });
    }

    const MAX_QUERY_LENGTH = 1000;
    if (query.length > MAX_QUERY_LENGTH) {
      return res.status(400).json({
        error: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`
      });
    }

    const result = await queryRag(query);

    res.json({ answer: result });
  } catch (err) {
    console.error('Error processing query:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
