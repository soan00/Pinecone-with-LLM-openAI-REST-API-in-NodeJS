import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from "langchain/document";
import { Pinecone } from "@pinecone-database/pinecone";

import AI from "openai";
// 2. Export the queryPineconeVectorStoreAndQueryLLM function
export const queryPineconeVectorStoreAndQueryLLM = async (
  indexName,
  question
) => {
  // 3. Start query process
  console.log("Querying Pinecone vector store...");
  // 4. Retrieve the Pinecone index
  const client = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,

  });
  const index = client.Index(indexName);
  // 5. Create query embedding
  const queryEmbedding = await new OpenAIEmbeddings().embedQuery(question);
  let queryResponse = await index.query({

    topK: 100,
    vector: queryEmbedding,
    includeMetadata: true,
    includeValues: true,

  });
  // 7. Log the number of matches 
  if (queryResponse.matches.length) {
    // 9. Create an OpenAI instance and load the QAStuffChain

    const llm = new OpenAI({ modelName: 'gpt-3.5-turbo' });
    const chain = loadQAStuffChain(llm);
    // 10. Extract and concatenate page content from matched documents
    const concatenatedPageContent = queryResponse.matches
      .map((match) => match.metadata.pageContent)
      .join("");

    // 11. Execute the chain with input documents and question  
    let result = '';
    for (let i = 0; i <= 1; i++) {
      const ans = await chain.call({
        input_documents: [new Document({ pageContent: concatenatedPageContent })],
        question: question,

      });
      result = result + ans.text;
    }


    const errorString = ["I don't know", "I'm sorry", "I'm not sure", "does not contain information"];


    if (errorString.some(error => result.includes(error))) {
      console.log("Asking to Chat GPT");
      const newQuestion = `${question} in ${indexName}`;

      const openai = new AI({
        apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
      });
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: newQuestion }],
        model: 'gpt-3.5-turbo',
      });
      console.log("response from ai", completion.choices[0].message.content);
      return {
        message: completion.choices[0].message.content,
        dataSource: 'Chat GPT '
      }
    } else {
      console.log(`Answer: ${result}`);
      return {
        message: result,
        dataSource: 'Pinecone DB'
      }
    }
    // 12. Log the answer

  }

};
