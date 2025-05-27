import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export const MAX_CHUNK_SIZE = 30000;
export const CHUNK_OVERLAP = 1500;
export const BATCH_SIZE = 25;

export const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || "",
});

export const INDEX_NAME = "lang-chain";
export const NAMESPACE = "rag-docs";

export const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001",
  apiKey: process.env.GOOGLE_API_KEY,
});
