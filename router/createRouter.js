import express from 'express';
import * as pinconeOp from "../controller/pinconeController.js"
const router = express.Router();
router.post('/', pinconeOp.createIndex)
export default router;