import { test } from "node:test";
import assert from "node:assert/strict";
import { loadFresh } from "./harness.mjs";

async function startedMonth(salary = "1000,00") {
  const app = loadFresh();
  await app.flush(); // let boot() finish rendering the start screen
  app.setVal("#salary-in", salary);
  app.click("[data-act='start-month']");
  await app.flush();
  return app;
}

test("adding Extra income raises the rendered Guilt-free number", async () => {
  const app = await startedMonth("1000,00");
  const before = app.doc.getElementById("gf-amt").textContent;

  app.setVal("#ex-name", "Q2 bonus");
  app.setVal("#ex-amt", "250,00");
  app.click("[data-act='add-extra']");
  await app.flush();

  const after = app.doc.getElementById("gf-amt").textContent;
  assert.notEqual(after, before);
  assert.match(after, /1[\s .]?250/); // 1000 + 250 guilt-free
  assert.match(app.doc.body.textContent, /Q2 bonus/);
});

test("the How? breakdown shows an Extra income line reconciling to Guilt-free", async () => {
  const app = await startedMonth("1000,00");
  app.setVal("#ex-name", "Refund");
  app.setVal("#ex-amt", "100,00");
  app.click("[data-act='add-extra']");
  await app.flush();

  app.click("[data-act='toggle-breakdown']");
  await app.flush();

  const rows = [...app.doc.querySelectorAll(".breakdown div")].map(d => d.textContent);
  const extraRow = rows.find(r => /Extra income/.test(r));
  assert.ok(extraRow, "breakdown has an Extra income row");
  assert.match(extraRow, /\+/);
});

test("adding Extra income without a name shows an inline error", async () => {
  const app = await startedMonth("1000,00");
  app.setVal("#ex-amt", "50,00");
  app.click("[data-act='add-extra']");
  await app.flush();

  const err = app.doc.querySelector(".err");
  assert.ok(err && /name/i.test(err.textContent));
});

test("removing an Extra income item requires a confirming second tap", async () => {
  const app = await startedMonth("1000,00");
  app.setVal("#ex-name", "Gift");
  app.setVal("#ex-amt", "40,00");
  app.click("[data-act='add-extra']");
  await app.flush();

  // First tap arms; the item is still present.
  app.click("[data-act='del-extra']");
  await app.flush();
  assert.match(app.doc.body.textContent, /Gift/, "one tap does not delete");

  // Second tap confirms the removal.
  app.click("[data-act='del-extra']");
  await app.flush();
  assert.doesNotMatch(app.doc.body.textContent, /Gift/, "second tap deletes");
});
