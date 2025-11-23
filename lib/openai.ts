import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. API routes depending on OpenAI will fail.");
}

export const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
