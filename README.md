# Krittya Chatbot Backend

A **Retrieval-Augmented Generation (RAG)** chatbot backend built for **Krittya**, a marketing agency. The service embeds a knowledge base into a **Pinecone** vector database and uses **Google Gemini** to generate grounded, context-aware answers to user questions through a simple Express.js API.

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Building the Knowledge Base](#building-the-knowledge-base)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Support](#support)

---

## Overview

This backend powers a chatbot that can answer questions about Krittya's services, offerings, and brand information. Instead of relying purely on an LLM's general knowledge (which can be outdated or inaccurate), it uses **RAG**:

1. Company knowledge is stored as plain text (`krittya_knowledge_base.txt`).
2. That text is chunked, embedded, and **upserted into Pinecone** (a vector database) via a Python script.
3. At query time, the Express server embeds the user's question, retrieves the most relevant chunks from Pinecone, and passes them as context to **Google Gemini**, which generates a natural-language answer grounded in that context.

This keeps answers accurate, on-brand, and easy to update — just edit the knowledge base file and re-run the upsert script.

## How It Works

```
                ┌─────────────────────┐
                │ krittya_knowledge   │
                │ _base.txt           │
                └──────────┬──────────┘
                           │  (one-time / on update)
                           ▼
                 ┌───────────────────┐
                 │  upserting.py     │  chunk + embed + upsert
                 └─────────┬─────────┘
                           ▼
                 ┌───────────────────┐
                 │  Pinecone Index    │  vector store
                 └─────────▲─────────┘
                           │ similarity search (top-K)
   ┌──────────┐    ┌───────┴────────┐    ┌────────────────────┐
   │  Client  │───▶│  server.js /   │───▶│  Google Gemini API  │
   │ (POST    │    │  query.js      │◀───│  (answer generation)│
   │  /ask)   │◀───│  (Express API) │    └────────────────────┘
   └──────────┘    └────────────────┘
```

1. A client sends a question to `POST /ask`.
2. `query.js` retrieves the top-K most relevant chunks from the Pinecone index (`krittay-vd`, default namespace `example-namespace`).
3. The retrieved context plus the user's question is sent to Gemini (default model `gemini-2.5-flash-lite`).
4. Gemini's generated answer is returned as JSON to the client.

## Tech Stack

| Layer | Technology |
|---|---|
| API server | [Express.js](https://expressjs.com/) 5.x (Node.js) |
| Vector database | [Pinecone](https://www.pinecone.io/) |
| LLM / generation | [Google Gemini](https://ai.google.dev/) via `@google/generative-ai` |
| Knowledge ingestion | Python (`upserting.py`) |
| Dev tooling | `nodemon`, `dotenv`, `cors` |

## Project Structure

```
resume_krittya_chatbot_backend/
├── server.js                    # Express server entry point, defines routes
├── query.js                     # Core RAG logic: embed query, search Pinecone, call Gemini
├── query.py                     # Python counterpart for querying (used for testing/dev)
├── upserting.py                 # Chunks and upserts the knowledge base into Pinecone
├── krittya_knowledge_base.txt   # Raw source text used to build the vector index
├── test.js                      # Basic tests for the API
├── package.json                 # Node.js dependencies and npm scripts
├── requirements.txt             # Python dependencies (pinecone-client, python-dotenv, etc.)
├── .env.example                 # Template for required environment variables
├── .gitignore
└── README.md
```

## Prerequisites

- **Node.js** 18+
- **Python** 3.8+ (only needed for building/updating the knowledge base index)
- A **Pinecone** account and API key
- A **Google Gemini** API key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/kushwanth-masupalli/resume_krittya_chatbot_backend.git
cd resume_krittya_chatbot_backend
```

### 2. Install Node.js dependencies

```bash
npm install
```

### 3. Install Python dependencies (for ingesting the knowledge base)

```bash
pip install -r requirements.txt
```

## Configuration

Copy the example env file and fill in your own credentials:

```bash
cp .env.example .env
```

Then edit `.env`:

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

> Never commit your real `.env` file — only `.env.example` should be tracked in git.

## Building the Knowledge Base

Before the chatbot can answer questions, the knowledge base needs to be embedded and pushed into Pinecone. Edit `krittya_knowledge_base.txt` with the content you want the bot to know about, then run:

```bash
python upserting.py
```

This reads the knowledge base text, generates embeddings, and upserts vectors into the Pinecone index/namespace configured in `.env`. Re-run this script any time the knowledge base content changes.

## Running the Server

**Development mode** (auto-restarts on file changes):

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

By default the server listens on `http://localhost:3000` (or the port set in `PORT`).

## API Reference

### `POST /ask`

Send a natural-language question to the chatbot.

**Request body:**

```json
{
  "query": "What services does Krittya offer?"
}
```

**Success response — `200 OK`:**

```json
{
  "answer": "Krittya offers branding, digital solutions, market research, strategy, and more..."
}
```

**Error response — `400 Bad Request`** (missing query):

```json
{
  "error": "Query is required"
}
```

### `GET /health`

Simple health check for uptime monitoring.

**Response — `200 OK`:**

```json
{
  "status": "ok",
  "timestamp": "2026-08-03T12:00:00.000Z"
}
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PINECONE_API_KEY` | Pinecone API key | **Required** |
| `PINECONE_INDEX_NAME` | Name of the Pinecone index to use | `krittay-vd` |
| `PINECONE_NAMESPACE` | Pinecone namespace within the index | `example-namespace` |
| `GEMINI_API_KEY` | Google Gemini API key | **Required** |
| `GEMINI_MODEL` | Gemini model used for generation | `gemini-2.5-flash-lite` |
| `PORT` | Port the Express server listens on | `3000` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `*` |
| `TOP_K` | Number of top matching chunks retrieved from Pinecone per query | `3` |
| `MAX_GENERATION_TOKENS` | Max tokens allowed in the generated response | `512` |

## Testing

Run the included test suite:

```bash
npm test
```

This executes `test.js` against the API to verify basic request/response behavior.

## Security Notes

- **Never commit your `.env` file** — it contains sensitive API keys and is excluded via `.gitignore`.
- **Rotate API keys immediately** if they are ever exposed (e.g., accidentally committed or shared).
- **Restrict CORS in production** by setting `ALLOWED_ORIGINS` to your specific frontend domain(s) instead of `*`.
- Consider adding rate limiting and request validation before exposing `/ask` publicly.

## Troubleshooting

| Issue | Likely Cause | Fix |
|---|---|---|
| `PINECONE_API_KEY` errors on startup | Missing/invalid `.env` values | Double-check `.env` matches `.env.example` and keys are valid |
| Empty or irrelevant answers | Knowledge base not upserted, or index/namespace mismatch | Re-run `python upserting.py`; verify `PINECONE_INDEX_NAME` / `PINECONE_NAMESPACE` match what was upserted |
| CORS errors from browser client | `ALLOWED_ORIGINS` doesn't include your frontend's origin | Add your frontend URL to `ALLOWED_ORIGINS` |
| Gemini quota/rate limit errors | Free-tier API limits exceeded | Check your Google AI Studio usage/quota, or upgrade plan |

