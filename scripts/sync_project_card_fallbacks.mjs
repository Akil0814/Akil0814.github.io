import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const { project_cards: cards } = JSON.parse(
  readFileSync(new URL("i18n/en/project_cards.json", root), "utf8")
);
const checkOnly = process.argv.includes("--check");
const descriptionPattern = /(<p\b[^>]*\bdata-i18n="project_cards\.([a-z]+)\.desc"[^>]*>)[\s\S]*?(<\/p>)/g;

function escapeHtml(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

let stale = false;
for (const name of ["index.html", "projects/index.html"]) {
  const file = new URL(name, root);
  const original = readFileSync(file, "utf8");
  const updated = original.replace(descriptionPattern, (_, opening, key, closing) => {
    if (typeof cards[key]?.desc !== "string") {
      throw new Error(`Missing English project description: ${key}`);
    }
    return opening + escapeHtml(cards[key].desc) + closing;
  });
  if (original === updated) continue;
  if (checkOnly) {
    console.error(`Outdated project descriptions in ${name}`);
    stale = true;
  } else {
    writeFileSync(file, updated);
    console.log(`Updated ${name}`);
  }
}

if (stale) process.exitCode = 1;
else if (checkOnly) console.log("Project card English fallbacks are up to date.");
