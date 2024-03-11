// app.js or index.js
import express from 'express';
import createIndexRouter from "./router/createRouter.js";
import updateDataRouter from "./router/updateRouter.js";
import queryRouter from "./router/queryRouter.js";
import bodyParser from 'body-parser';
import * as dotenv from "dotenv";
dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/createIndex', createIndexRouter);
app.use('/updateData', updateDataRouter);
app.use('/query', queryRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
