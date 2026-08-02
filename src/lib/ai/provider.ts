import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

export function getLanguageModel() {
  const provider = (process.env.AI_PROVIDER || "google").toLowerCase();

  if (provider === "openai") {
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
    return openai(process.env.OPENAI_MODEL || "gpt-4o-mini");
  }

  // Default: Google Gemini
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "",
  });

  return google(process.env.AI_MODEL || "gemini-1.5-flash");
}
