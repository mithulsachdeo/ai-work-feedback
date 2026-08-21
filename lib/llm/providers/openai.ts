import OpenAI from "openai";
import { MODELS } from "@/constants";

export async function callOpenAI(system: string, user: string, apiKey: string): Promise<string> {
  const client = new OpenAI({ apiKey });
  const res = await client.chat.completions.create({
    model: MODELS.openai,
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: system }, { role: "user", content: user }],
  });
  return res.choices[0]?.message?.content ?? "";
}
