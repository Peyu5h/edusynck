import { ChatMistralAI } from "@langchain/mistralai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

export const mistralLLM = new ChatMistralAI({
  modelName: "mistral-small-latest",
  temperature: 0,
  maxTokens: 1024,
});

export const geminiLLM = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0,
  maxOutputTokens: 1024,
});

export const openAILLM = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0,
  maxTokens: 1024,
});

export const llm = geminiLLM;
