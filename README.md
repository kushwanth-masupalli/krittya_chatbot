# Krittya Chat Bot Backend

A RAG (Retrieval-Augmented Generation) based chatbot backend for Krittya marketing agency, built with Express.js, Pinecone, and Google Gemini AI.

## Features

- **RAG-based responses**: Retrieves relevant information from Pinecone vector database
- **AI-powered answers**: Uses Google Gemini AI to generate contextual responses
- **CORS support**: Configurable cross-origin resource sharing
- **Health endpoint**: Built-in `/health` endpoint for monitoring

## Prerequisites

- Node.js 18+ 
- Python 3.8+ (for data upserting)
- Pinecone API key
- Google Gemini API key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/kushwanth-masupalli/krittya_chatbot.git
cd krittya_chatbot
```

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Install Python dependencies (for upserting)

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=krittay-vd
PINECONE_NAMESPACE=example-namespace

# Google Gemini Configuration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite

# Server Configuration
PORT=3000
ALLOWED_ORIGINS=*

# RAG Configuration
TOP_K=3
MAX_GENERATION_TOKENS=512
```

## Usage

### Upsert Knowledge Base Data

Before running the server, upsert your knowledge base to Pinecone:

```bash
python upserting.py
```

### Start the Server

**Development mode (with nodemon):**
```bash
npx nodemon server.js
```

**Production mode:**
```bash
node server.js
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### POST /ask

Send a query to the chatbot.

**Request:**
```json
{
  "query": "What services does Krittya offer?"
}
```

**Response:**
```json
{
  "answer": "Krittya offers branding, digital solutions, market research, strategy, and more..."
}
```

**Error Response:**
```json
{
  "error": "Query is required"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-09T12:00:00.000Z"
}
```

## Project Structure

```
krittya_chat_bot_backend/
├── server.js           # Express server entry point
├── query.js            # RAG query logic with Pinecone & Gemini
├── upserting.py        # Python script to upsert knowledge base
├── krittya_knowledge_base.txt  # Raw knowledge base content
├── .env                # Environment variables (not in git)
├── .gitignore          # Git ignore rules
├── package.json        # Node.js dependencies
├── requirements.txt    # Python dependencies
└── README.md           # This file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PINECONE_API_KEY` | Pinecone API key | Required |
| `PINECONE_INDEX_NAME` | Pinecone index name | `krittay-vd` |
| `PINECONE_NAMESPACE` | Pinecone namespace | `example-namespace` |
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `GEMINI_MODEL` | Gemini model to use | `gemini-2.5-flash-lite` |
| `PORT` | Server port | `3000` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `*` |
| `TOP_K` | Number of documents to retrieve | `3` |
| `MAX_GENERATION_TOKENS` | Max tokens in response | `512` |

## Security Notes

- **Never commit `.env` file** - It contains sensitive API keys
- **Rotate API keys** if they have been exposed
- **Restrict CORS origins** in production by setting `ALLOWED_ORIGINS` to specific domains

## Testing

Run tests:
```bash
npm test
```

## License

ISC

## Support

For issues or questions, contact:
- Phone: +91 81000 24327
- Email: hello@krittya.com
