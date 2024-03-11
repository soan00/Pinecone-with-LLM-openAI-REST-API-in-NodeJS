import * as createPineconeIndex from "../service/createPineconeIndex.js";
import * as updatePineconeData from '../service/updatePinecone.js';
import * as querySearchData from '../service/queryPineconeAndQueryGPT.js';
export const createIndex = async (req, res, next) => {
    try {
        const { indexName } = req.body;
        const response = await createPineconeIndex.createPineconeIndex(indexName);
        res.status(200).json({
            message: response
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
}
export const updateData = async (req, res, next) => {
    try {
        const { indexName } = req.body;
        const response = await updatePineconeData.updatePinecone(indexName);
        res.status(200).json({
            message: response
        });
    } catch (error) {
        res.status(500).send(error.message);

    }
}
export const querySearch = async (req, res, next) => {
    try {
        const { indexName, question } = req.body;
        const response = await querySearchData.queryPineconeVectorStoreAndQueryLLM(indexName, question);
        res.status(200).json({
            answer: response.message,
            dataSource: response.dataSource
        });
    } catch (error) {
        res.status(500).send(error.message);

    }
}