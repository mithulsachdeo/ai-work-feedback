import { GoogleGenerativeAI } from "@google/generative-ai";
import { MODELS } from "@/constants";

export async function callGemini(system: string, user: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODELS.gemini,
    systemInstruction: system,
    generationConfig: { responseMimeType: "application/json" },
  });
  const res = await model.generateContent(user);
  return res.response.text();
}
