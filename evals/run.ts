import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { evaluate } from "@/lib/llm/evaluate";
import { GOLDEN, levelAtWorst, levelAtLeast } from "./golden-set";

async function main() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Set GEMINI_API_KEY in .env.local");
  let failures = 0;

  for (const c of GOLDEN) {
    try {
      // Thread c.role through, same as the real app does — exercises role-analogy tailoring for cases that set it.
      const { result } = await evaluate(c.submission, { provider: "gemini", apiKey: key, byo: false }, undefined, c.role);

      if (c.expectNotEvaluable) {
        const ok = "not_evaluable" in result && result.not_evaluable === true;
        console.log(`${ok ? "PASS" : "FAIL"}  ${c.id}  (expected not_evaluable)`);
        if (!ok) failures++;
        continue;
      }
      if ("not_evaluable" in result && result.not_evaluable) {
        console.log(`FAIL  ${c.id}  (got not_evaluable, expected a score)`);
        failures++;
        continue;
      }

      for (const [crit, exp] of Object.entries(c.expect ?? {})) {
        const r = (result as any).criteria[crit];
        const worstOk = !exp!.atWorst || levelAtWorst(r.level, exp!.atWorst);
        const leastOk = !exp!.atLeast || levelAtLeast(r.level, exp!.atLeast);
        const mentionOk =
          !exp!.mustMention ||
          (r.evidence + r.next_step).toLowerCase().includes(exp!.mustMention.toLowerCase());
        const ok = worstOk && leastOk && mentionOk;
        const want = [exp!.atWorst ? `≤ ${exp!.atWorst}` : null, exp!.atLeast ? `≥ ${exp!.atLeast}` : null]
          .filter(Boolean)
          .join(", ");
        console.log(
          `${ok ? "PASS" : "FAIL"}  ${c.id}  ${crit}=${r.level} (want ${want}${
            exp!.mustMention ? `, mentions "${exp!.mustMention}"` : ""
          })`
        );
        if (!ok) failures++;
      }
    } catch (e) {
      console.log(`ERROR ${c.id}: ${(e as Error).message}`);
      failures++;
    }
  }
  console.log(`\n${failures === 0 ? "ALL PASS" : failures + " FAILURES"}`);
  process.exit(failures === 0 ? 0 : 1);
}
main();
