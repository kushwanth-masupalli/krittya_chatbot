import time
from pinecone import Pinecone
import google.generativeai as genai
import sys
from dotenv import load_dotenv
import os

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

INDEX_NAME = "krittay-vd"
TOP_K = 3
MODEL_NAME = "gemini-2.5-flash-lite"
import time
from pinecone import Pinecone
import google.generativeai as genai



pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(MODEL_NAME)


def query_rag(query: str):
    start_time = time.time()

    # 1️⃣ Pinecone search (records API)
    results = index.search(
        namespace="example-namespace",
        query={
            "inputs": {"text": query},
            "top_k": TOP_K
        }
    )

    # 2️⃣ Extract chunks CORRECTLY
    chunks = []
    for hit in results["result"]["hits"]:
        text = hit["fields"].get("text")
        if text:
            chunks.append(text)

    # 3️⃣ Guard clause
    if not chunks:
        return {
            "query": query,
            "answer": "I don't know.",
            "chunks_used": 0,
            "latency": round(time.time() - start_time, 3)
        }

    # 4️⃣ RAG prompt
    prompt = f"""
Answer the question using ONLY the context below.
If the answer is not present, say "I don't know".

Context:
{chr(10).join(chunks)}

Question:
{query}

Answer:
"""

    # 5️⃣ Geminia
    response = model.generate_content(prompt)

    return {
        "query": query,
        "answer": response.text,
        "chunks_used": len(chunks),
        "latency": round(time.time() - start_time, 3)
    }


if __name__ == "__main__":
    user_query = sys.argv[1]
    result = query_rag(user_query)
    print(result["answer"])
