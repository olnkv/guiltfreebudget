// Dev-only test harness. Loads the real shipped index.html into a headless
// DOM and hands back the actual globals the app defines, so tests exercise the
// same `totals` / `parseMoney` code that ships — no source is extracted.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JSDOM } from "jsdom";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, "..", "index.html"), "utf8");

let cached = null;

// Returns { totals, parseMoney } from a freshly loaded copy of the app.
// External resources (fonts, the Supabase CDN import) are never fetched; the
// app's own try/catch swallows the unavailable sync path.
export function loadApp() {
  if (cached) return cached;
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "http://localhost/",
  });
  const { window } = dom;
  if (typeof window.totals !== "function" || typeof window.parseMoney !== "function") {
    throw new Error("app did not expose totals/parseMoney on the global object");
  }
  cached = { totals: window.totals, parseMoney: window.parseMoney, window };
  return cached;
}

// A fresh, un-cached app instance for DOM-level tests that drive real clicks.
// Returns the window and a flush() that lets the app's async action handlers
// settle (they await commit → save → render).
export function loadFresh() {
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    pretendToBeVisual: true,
    url: "http://localhost/",
  });
  const { window } = dom;
  const flush = () => new Promise((r) => window.setTimeout(r, 0));
  const click = (sel) => window.document.querySelector(sel).click();
  const setVal = (sel, v) => { window.document.querySelector(sel).value = v; };
  return { window, doc: window.document, flush, click, setVal };
}

// Minimal state factory mirroring what start-month constructs.
export function makeState(over = {}) {
  return {
    active: true,
    monthLabel: "January 2026",
    salaryCents: 0,
    extra: [],
    fixed: [],
    budgets: [],
    updatedAt: 0,
    ...over,
  };
}

export const item = (name, cents) => ({ id: name, name, cents });
export const budget = (over = {}) => ({
  id: "b", name: "Food", limitCents: 0, settled: false, logs: [], ...over,
});
export const log = (cents) => ({ id: "l" + cents, cents, note: "", ts: 0 });
