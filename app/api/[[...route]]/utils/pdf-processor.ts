import { storeDocumentInPinecone } from "./vectorDB/vector-store";

export const processPdfText = async (
  fileName: string,
  textContent: string,
): Promise<{ id: string; name: string; uploadDate: Date }> => {
  try {
    const fileId = crypto.randomUUID();
    console.log(`Processing document: ${fileName} with ID: ${fileId}`);

    // Store document embeddings in Pinecone
    await storeDocumentInPinecone(textContent, fileId, fileName);

    return {
      id: fileId,
      name: fileName,
      uploadDate: new Date(),
    };
  } catch (error: any) {
    console.error("Error processing PDF text:", error);
    throw new Error(`Failed to process PDF text: ${error.message}`);
  }
};
