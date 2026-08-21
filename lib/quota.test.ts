import { getRemaining, consumeQuota } from "./quota";

test("getRemaining reports the gap under the cap", async () => {
  const r = await getRemaining("u1", { used: async () => 3, consume: async () => {} });
  expect(r).toBe(7); // 10 - 3
});

test("getRemaining is 0 at the cap", async () => {
  const r = await getRemaining("u1", { used: async () => 10, consume: async () => {} });
  expect(r).toBe(0);
});

test("consumeQuota calls the consume dep exactly once", async () => {
  let n = 0;
  await consumeQuota("u1", { used: async () => 0, consume: async () => { n++; } });
  expect(n).toBe(1);
});
