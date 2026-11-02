import express from 'express';
import cors from 'cors';
import {StringOutputParser} from '@langchain/core/output_parsers'
import {ChatPromptTemplate} from '@langchain/core/prompts'
import model from '../model'

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});