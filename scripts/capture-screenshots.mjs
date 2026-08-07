/**
 * Capture fresh product screenshots from the live site for README docs.
 * Run: node scripts/capture-screenshots.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../screenshots");
const BASE = "https://foodanalyserr.vercel.app";
const API = "https://foodanalyser.onrender.com";
const VIEWPORT = { width: 1440, height: 900 };

async function shot(page, name) {
  const file = path.join(OUT, name);
  await page.waitForTimeout(800);
  await page.screenshot({
    path: file,
    fullPage: false,
    type: "png",
    animations: "disabled",
  });
  const stat = fs.statSync(file);
  console.log(`✓ ${name} (${Math.round(stat.size / 1024)} KB)`);
}

async function warmApi() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 60000);
    const res = await fetch(`${API}/health`, { signal: ctrl.signal });
    clearTimeout(t);
    console.log("✓ API warm", res.status);
  } catch (e) {
    console.log("… API warm soft-fail:", e.message);
  }
}

async function goto(page, route) {
  await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1800);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) {
    if (f.endsWith(".png") || f === "README.md") fs.unlinkSync(path.join(OUT, f));
  }

  await warmApi();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1.25,
    colorScheme: "dark",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  // Home
  await goto(page, "/");
  await shot(page, "home.png");

  // Food search results
  const input = page.locator("#food-input");
  await input.click({ force: true });
  await input.fill("butter chicken");
  await page.keyboard.press("Enter");
  try {
    await page.waitForSelector(".fa-result-card", { timeout: 70000 });
    await page.locator("#search-results").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
  } catch {
    console.log("… search results slow — capturing current state");
  }
  await shot(page, "food-search.png");

  // Cuisine
  await goto(page, "/cuisine/punjab");
  await shot(page, "cuisine.png");

  // Category
  await goto(page, "/category/high-protein");
  await shot(page, "category.png");

  // Compare
  await goto(page, "/compare/roti");
  await shot(page, "compare.png");

  // Diet plan
  await goto(page, "/plan");
  await shot(page, "diet-plan.png");

  // Tracker
  await goto(page, "/tracker");
  await shot(page, "tracker.png");

  // Recipe
  await goto(page, "/recipe");
  await shot(page, "recipe.png");

  // Calculator
  await goto(page, "/calculator");
  await shot(page, "calculator.png");

  // Barcode scan
  await goto(page, "/scan");
  await shot(page, "barcode-scan.png");

  // Image recognition
  await goto(page, "/image");
  await shot(page, "image-recognition.png");

  // About
  await goto(page, "/about");
  await shot(page, "about.png");

  // Reviews
  await goto(page, "/review");
  await shot(page, "reviews.png");

  // Profile
  await goto(page, "/profile");
  await shot(page, "profile.png");

  // 404 — wait for message fade-in
  await goto(page, "/does-not-exist-404-demo");
  await page.waitForTimeout(2500);
  await shot(page, "not-found.png");

  await browser.close();
  console.log("\nDone →", OUT);
  console.log(fs.readdirSync(OUT).sort().join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
