require('dotenv').config();

const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ---------------- CONFIG ----------------
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const INDEX_NAME = 'krittay-vd';
const NAMESPACE = 'example-namespace';
const TOP_K = 3;
const MODEL_NAME = 'gemini-2.5-flash-lite';

// ---------------- INIT CLIENTS ----------------
const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
const namespace = pc.index(INDEX_NAME).namespace(NAMESPACE);

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// ---------------- RAG FUNCTION ----------------
async function queryRag(query) {
  const startTime = Date.now();

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
    return "I don't know.";
  }

  // 3️⃣ RAG prompt
  const prompt = `
Answer the question using ONLY the context below.
If the answer is not present, say 
"sorry i can't answer this question contact kritty team +91 81000 24327 
 or hello@krittya.com".

Context:
${chunks.join('\n')}

Question:
${query}

Answer:
`;

  // 4️⃣ Gemini generation
  const result = await model.generateContent(prompt);
  const answer = result.response.text();

  return answer;
}

module.exports = { queryRag };
