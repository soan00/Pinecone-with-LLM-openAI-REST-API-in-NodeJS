import { Pinecone } from "@pinecone-database/pinecone";

export const createPineconeIndex = async (indexName) => {
  console.log(`Checking "${indexName}"...`);
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });

  const vectorDimension = 1536;
  const existingIndexes = await client.listIndexes();
  if (!existingIndexes.indexes.includes(indexName)) {
    console.log(`Creating "${indexName}"...`);
    const createClient = await client.createIndex({
      name: indexName,
      dimension: vectorDimension,
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-west-2',
        },
      },

    });
    console.log(`Created with client:`, createClient);
    await new Promise((resolve) => setTimeout(resolve, 60000));
    return `"${indexName}" created successfully.`
  } else {
    console.log(`"${indexName}" already exists.`);
    return `"${indexName}" already exists.`
  }
};
