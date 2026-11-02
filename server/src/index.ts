import express from 'express';
import cors from 'cors';
import {StringOutputParser} from '@langchain/core/output_parsers'
import {ChatPromptTemplate, PromptTemplate} from '@langchain/core/prompts'
import model from '../model'

const app = express();
const port = 3000;

app.use(cors());
// 解析 application/x-www-form-urlencoded 格式的请求体
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

// 创建平铺 Model 工作流： Prompt -> Modal -> OutputParser
async function createChain(promptTemplate:string) {
  const prompt = ChatPromptTemplate.fromTemplate(promptTemplate)
  return prompt.pipe(model).pipe(new StringOutputParser())
}

// SSE 流式返回接口
app.post('/stream', async (req, res)=> {
  const {question} = req.body
  if(!question){
    res.status(400).send('Question is required')
    return
  }

  // 构建链式工作流，传入 question
  const chain = await createChain('{question}')
  const stream = await chain.stream({question})

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // 流式返回生成结果
  for await(const chunk of stream){
    res.write(`data: ${chunk}\n\n`)
  }

  res.end()
})



app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});