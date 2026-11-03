import { ChatDeepSeek } from '@langchain/deepseek';
import "dotenv/config";

export default new ChatDeepSeek({
  model: "deepseek-flash",
  temperature: 0,
  maxTokens: 5,
  configuration: {
    baseURL: process.env.BASE_URL,
    apiKey: process.env.API_KEY,
  },
});
