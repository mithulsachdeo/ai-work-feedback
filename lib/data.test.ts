import { saveSubmission } from "./data";

test("saveSubmission inserts and returns the new id", async () => {
  const calls: any[] = [];
  const fakeSb = {
    from(table: string) {
      return {
        insert(row: any) { calls.push({ table, row }); return this; },
        select() { return this; },
        single: async () => ({ data: { id: "sub-1" }, error: null }),
      };
    },
  };
  const id = await saveSubmission("u1", { type: "work_product", intent: "i", text: "t" }, {}, fakeSb as any);
  expect(id).toBe("sub-1");
  expect(calls[0].table).toBe("submissions");
  expect(calls[0].row.user_id).toBe("u1");
});

test("saveSubmission stores a placeholder when doNotStore is set", async () => {
  const calls: any[] = [];
  const fakeSb = {
    from() {
      return {
        insert(row: any) { calls.push(row); return this; },
        select() { return this; },
        single: async () => ({ data: { id: "sub-2" }, error: null }),
      };
    },
  };
  await saveSubmission("u1", { type: "work_product", intent: "i", text: "secret work" }, { doNotStore: true }, fakeSb as any);
  expect(calls[0].text).not.toContain("secret");
});

// (added 2026-08-21, from requirements audit)
test("saveSubmission stores originalDraft when present", async () => {
  const calls: any[] = [];
  const fakeSb = {
    from() {
      return {
        insert(row: any) { calls.push(row); return this; },
        select() { return this; },
        single: async () => ({ data: { id: "sub-3" }, error: null }),
      };
    },
  };
  await saveSubmission("u1", { type: "implementation_logic", intent: "i", text: "corrected", originalDraft: "raw draft" }, {}, fakeSb as any);
  expect(calls[0].original_draft).toBe("raw draft");
});

// (added 2026-08-21, from plan grill)
test("getSubmissionOwner returns the owning user_id", async () => {
  const fakeSb = {
    from() {
      return { select() { return this; }, eq() { return this; }, single: async () => ({ data: { user_id: "u1" }, error: null }) };
    },
  };
  const { getSubmissionOwner } = await import("./data");
  expect(await getSubmissionOwner("sub-1", fakeSb as any)).toBe("u1");
});

test("getSubmissionOwner returns null when the submission doesn't exist", async () => {
  const fakeSb = {
    from() {
      return { select() { return this; }, eq() { return this; }, single: async () => ({ data: null, error: { message: "not found" } }) };
    },
  };
  const { getSubmissionOwner } = await import("./data");
  expect(await getSubmissionOwner("missing", fakeSb as any)).toBe(null);
});

// (added 2026-08-21, from history-gap grill)
test("getLastSubmission returns the latest submission + evaluation", async () => {
  const fakeSb = {
    from(table: string) {
      if (table === "submissions") {
        return { select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
          single: async () => ({ data: { id: "sub-9", type: "work_product", intent: "i", text: "hello" }, error: null }) };
      }
      return { select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
        single: async () => ({ data: { id: "ev-9", result_json: { fix_this_first: "x", criteria: {} } }, error: null }) };
    },
  };
  const { getLastSubmission } = await import("./data");
  const r = await getLastSubmission("u1", fakeSb as any);
  expect(r?.submissionId).toBe("sub-9");
  expect(r?.evaluationId).toBe("ev-9");
});

test("getLastSubmission returns null when the last submission was not_evaluable", async () => {
  const fakeSb = {
    from(table: string) {
      if (table === "submissions") {
        return { select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
          single: async () => ({ data: { id: "sub-9", type: "work_product", intent: "i", text: "hello" }, error: null }) };
      }
      return { select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
        single: async () => ({ data: { id: "ev-9", result_json: { not_evaluable: true, reason: "gibberish" } }, error: null }) };
    },
  };
  const { getLastSubmission } = await import("./data");
  expect(await getLastSubmission("u1", fakeSb as any)).toBe(null);
});

test("getLastSubmission returns null when the last submission used doNotStore", async () => {
  const fakeSb = {
    from() {
      return { select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
        single: async () => ({ data: { id: "sub-9", type: "work_product", intent: "i", text: "[not stored at user request]" }, error: null }) };
    },
  };
  const { getLastSubmission } = await import("./data");
  expect(await getLastSubmission("u1", fakeSb as any)).toBe(null);
});
