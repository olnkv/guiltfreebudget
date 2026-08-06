import { test } from "node:test";
import assert from "node:assert/strict";
import { loadApp, makeState, item, budget, log } from "./harness.mjs";

const { totals, parseMoney } = loadApp();

test("Extra income raises Guilt-free by exactly the summed amount", () => {
  const st = makeState({
    salaryCents: 100000,
    extra: [item("Q2 bonus", 50000)],
  });
  const t = totals(st);
  assert.equal(t.extra, 50000);
  assert.equal(t.guilt, 150000); // salary + extra − fixed − reserved
});

test("Multiple Extra income items sum correctly", () => {
  const st = makeState({
    salaryCents: 100000,
    extra: [item("Bonus", 20000), item("Refund", 5000), item("Gift", 1000)],
  });
  const t = totals(st);
  assert.equal(t.extra, 26000);
  assert.equal(t.guilt, 126000);
});

test("Absent extra field behaves exactly as pre-feature math (back-compat)", () => {
  const st = makeState({ salaryCents: 100000 });
  delete st.extra; // state saved before this feature existed
  const t = totals(st);
  assert.equal(t.extra, 0);
  assert.equal(t.guilt, 100000);
});

test("Empty extra array leaves Guilt-free unchanged", () => {
  const st = makeState({ salaryCents: 80000, extra: [] });
  const t = totals(st);
  assert.equal(t.extra, 0);
  assert.equal(t.guilt, 80000);
});

test("Extra income composes with fixed and reserved", () => {
  const st = makeState({
    salaryCents: 100000,
    extra: [item("Bonus", 30000)],
    fixed: [item("Rent", 40000)],
    budgets: [budget({ limitCents: 20000 })], // open budget reserves full limit
  });
  const t = totals(st);
  assert.equal(t.fixed, 40000);
  assert.equal(t.reserved, 20000);
  // 100000 + 30000 − 40000 − 20000
  assert.equal(t.guilt, 70000);
});

test("Extra income offsets an over-budget position, bringing Guilt-free back to black", () => {
  // Over-budget, unsettled: budget limit 100, spent 300 → reserved = 300.
  // Salary 400 − reserved 300 = 100 guilt-free before extra.
  const overBudget = budget({ limitCents: 10000, logs: [log(30000)] });
  const before = totals(makeState({ salaryCents: 40000, budgets: [overBudget] }));
  assert.equal(before.reserved, 30000);
  assert.equal(before.guilt, 10000);

  // A bonus enlarges the pool and lifts guilt-free further.
  const after = totals(makeState({
    salaryCents: 40000,
    budgets: [budget({ limitCents: 10000, logs: [log(30000)] })],
    extra: [item("Bonus", 25000)],
  }));
  assert.equal(after.guilt, 35000);
});

test("parseMoney still rejects zero, negatives, and malformed input", () => {
  assert.equal(parseMoney("0"), null);
  assert.equal(parseMoney("0,00"), null);
  assert.equal(parseMoney("-5"), null);
  assert.equal(parseMoney("abc"), null);
  assert.equal(parseMoney(""), null);
  assert.equal(parseMoney("12,40"), 1240); // still accepts valid positive money
});
