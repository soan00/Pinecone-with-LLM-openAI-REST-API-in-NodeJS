import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Pinecone } from "@pinecone-database/pinecone";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import path from 'path';
import { fileURLToPath } from 'url';
export const updatePinecone = async (indexName) => {
  console.log("Retrieving Pinecone index...");
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });
  const index = client.Index(indexName);
  console.log(`Pinecone index retrieved: ${indexName}`);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename, '..');
  const parentDirectory = path.resolve(__dirname, '..');
  const documentDirectory = path.join(parentDirectory, 'document');
  const loader = new DirectoryLoader(documentDirectory, {
    ".txt": (path) => new TextLoader(path),
    ".pdf": (path) => new PDFLoader(path),
  });
  const docs = await loader.load();
  for (const doc of docs) {
    console.log(`Processing document: ${doc.metadata.source}`);
    const txtPath = doc.metadata.source;
    const text = doc.pageContent;
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    console.log("Splitting text into chunks...");
    const chunks = await textSplitter.createDocuments([text]);
    console.log(`Text split into ${chunks.length} chunks`);
    console.log(
      `Calling OpenAI's Embedding endpoint documents with ${chunks.length} text chunks ...`
    );
    const embeddingsArrays = await new OpenAIEmbeddings().embedDocuments(
      chunks.map((chunk) => chunk.pageContent.replace(/\n/g, " "))
    );
    console.log("Finished embedding documents");
    console.log(
      `Creating ${chunks.length} vectors array with id, values, and metadata...`
    );
    const batchSize = 100;
    let batch = [];
    for (let idx = 0; idx < chunks.length; idx++) {
      const chunk = chunks[idx];
      const vector = {
        id: `${txtPath}_${idx}`,
        values: embeddingsArrays[idx],
        metadata: {
          ...chunk.metadata,
          loc: JSON.stringify(chunk.metadata.loc),
          pageContent: chunk.pageContent,
          txtPath: txtPath,
        },
      };
      batch.push(vector);
      if (batch.length === batchSize || idx === chunks.length - 1) {
        await index.upsert(batch)
        batch = [];
      }
    }
    console.log(`Pinecone index updated with ${chunks.length} vectors`);
    return `Pinecone index updated with ${chunks.length} vectors`;
  }
};
