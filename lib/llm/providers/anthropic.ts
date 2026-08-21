import Anthropic from "@anthropic-ai/sdk";
import { MODELS } from "@/constants";

export async function callAnthropic(system: string, user: string, apiKey: string): Promise<string> {
  const client = new Anthropic({ apiKey });
  const msg = await client.messages.create({
    model: MODELS.anthropic,
    max_tokens: 2000,
    system,
    messages: [{ role: "user", content: user + "\n\nReturn only the JSON object." }],
  });
  const block = msg.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "";
}
