import {
  BATCH_SIZE,
  embeddings,
  INDEX_NAME,
  NAMESPACE,
  pinecone,
} from "./config";

import {
  chunkDocument,
  createBatches,
  padEmbeddingVector,
  validatePineconeIndex,
} from "./helper";

export async function storeDocumentInPinecone(
  text: string,
  fileId: string,
  fileName: string,
): Promise<void> {
  try {
    const { indexDim } = await validatePineconeIndex();
    const chunks = await chunkDocument(text, fileId, fileName);
    const records = [];

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embeddings.embedQuery(chunks[i].pageContent);
      records.push({
        id: `${fileId}-chunk-${i}`,
        values: padEmbeddingVector(embedding, indexDim),
        metadata: {
          fileId,
          fileName,
          text: chunks[i].pageContent.slice(0, 1000),
          uploadDate: new Date().toISOString(),
        },
      });
    }

    const index = pinecone.Index(INDEX_NAME);
    const batches = createBatches(records, BATCH_SIZE);

    for (const batch of batches) {
      await index.namespace(NAMESPACE).upsert(batch);
    }
  } catch (error) {
    throw new Error(
      `Failed to process document: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function queryPineconeStore(
  query: string,
  fileId: string,
): Promise<string[]> {
  try {
    const { indexDim } = await validatePineconeIndex();
    const queryEmbedding = await embeddings.embedQuery(query);
    const paddedQueryEmbedding = padEmbeddingVector(queryEmbedding, indexDim);

    const index = pinecone.Index(INDEX_NAME);
    const queryResults = await index.namespace(NAMESPACE).query({
      vector: paddedQueryEmbedding,
      topK: 5,
      includeMetadata: true,
      filter: { fileId: { $eq: fileId } },
    });

    const relevantChunks = queryResults.matches
      .filter((match: any) => match.metadata?.text)
      .map((match: any) => match.metadata?.text as string);

    if (relevantChunks.length === 0) {
      return ["No relevant information found in the document."];
    }

    return relevantChunks;
  } catch (error) {
    return [
      `Error searching the document. Please try again with a more specific question.`,
    ];
  }
}

export async function listPineconeDocuments(): Promise<
  {
    id: string;
    name: string;
    uploadDate: string;
  }[]
> {
  try {
    const index = pinecone.Index(INDEX_NAME);
    const { indexDim } = await validatePineconeIndex();

    const zeroVector = Array(indexDim).fill(0);
    const results = await index.namespace(NAMESPACE).query({
      vector: zeroVector,
      topK: 100,
      includeMetadata: true,
    });

    const documentMap = new Map();

    if (results.matches && Array.isArray(results.matches)) {
      results.matches.forEach((match: any) => {
        if (match.metadata?.fileId && !documentMap.has(match.metadata.fileId)) {
          documentMap.set(match.metadata.fileId, {
            id: match.metadata.fileId,
            name:
              match.metadata.fileName ||
              `Document-${match.metadata.fileId.slice(0, 8)}`,
            uploadDate: match.metadata.uploadDate || new Date().toISOString(),
          });
        }
      });
    }

    return Array.from(documentMap.values()).sort(
      (a, b) =>
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime(),
    );
  } catch (error) {
    return [];
  }
}

export async function deletePineconeVectors(fileId: string): Promise<boolean> {
  try {
    const index = pinecone.Index(INDEX_NAME);
    await index.namespace(NAMESPACE).deleteMany({ fileId: { $eq: fileId } });
    return true;
  } catch (error) {
    return false;
  }
}
