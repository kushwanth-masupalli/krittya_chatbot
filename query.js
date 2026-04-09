require('dotenv').config();

const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ---------------- CONFIG ----------------
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'krittay-vd';
const NAMESPACE = process.env.PINECONE_NAMESPACE || 'example-namespace';
const TOP_K = parseInt(process.env.TOP_K, 10) || 3;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
const MAX_GENERATION_TOKENS = parseInt(process.env.MAX_GENERATION_TOKENS, 10) || 512;

// Validate required environment variables
if (!PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY is required');
}
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required');
}

// ---------------- INIT CLIENTS ----------------
const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
const namespace = pc.index(INDEX_NAME).namespace(NAMESPACE);

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: {
    maxOutputTokens: MAX_GENERATION_TOKENS
  }
});

// ---------------- RAG FUNCTION ----------------
async function queryRag(query) {
  // 1️⃣ Search integrated records (TEXT → TEXT)
  const response = await namespace.searchRecords({
    query: {
      inputs: { text: query },
      topK: TOP_K,
    },
  });

  const hits = response?.result?.hits || [];

  const chunks = hits
    .map(hit => hit.fields?.text)
    .filter(Boolean);

  // 2️⃣ Guard clause
  if (chunks.length === 0) {
    return "I don't have information about that. Please contact Krittya team at +91 81000 24327 or hello@krittya.com";
  }

  // 3️⃣ RAG prompt
  const prompt = `
Answer the question using ONLY the context below.
If the answer is not present in the context, say "sorry i can't answer this question contact kritty team +91 81000 24327 or hello@krittya.com".

Context:
${chunks.join('\n')}

Question:
${query}

Answer:
`;

  // 4️⃣ Gemini generation
  const result = await model.generateContent(prompt);
  const answer = result.response.text();

  return answer.trim();
}

module.exports = { queryRag };
