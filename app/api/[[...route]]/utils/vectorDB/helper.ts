import {
  CHUNK_OVERLAP,
  embeddings,
  INDEX_NAME,
  MAX_CHUNK_SIZE,
  pinecone,
} from "./config";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";

export async function validatePineconeIndex(): Promise<{
  embeddingDim: number;
  indexDim: number;
}> {
  const testEmbedding = await embeddings.embedQuery("test");
  const embeddingDim = testEmbedding.length;

  const indexInfo = await pinecone.describeIndex(INDEX_NAME);
  const indexDim = indexInfo.dimension || 1024;
  return {
    embeddingDim,
    indexDim,
  };
}

export function padEmbeddingVector(
  vector: number[],
  targetDimension: number,
): number[] {
  if (vector.length === targetDimension) return vector;
  if (vector.length > targetDimension) return vector.slice(0, targetDimension);
  return [...vector, ...new Array(targetDimension - vector.length).fill(0)];
}

export async function chunkDocument(
  text: string,
  fileId: string,
  fileName: string,
): Promise<Document[]> {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: MAX_CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const baseDocument = new Document({
    pageContent: text,
    metadata: {
      fileId,
      fileName: fileName || `Document-${fileId.slice(0, 8)}`,
      uploadDate: new Date().toISOString(),
    },
  });

  return textSplitter.splitDocuments([baseDocument]);
}

export function createBatches<T>(items: T[], batchSize: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / batchSize) }, (_, i) =>
    items.slice(i * batchSize, (i + 1) * batchSize),
  );
}
