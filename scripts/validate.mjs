#!/usr/bin/env node
/**
 * Validates every template in templates/:
 *  - required files: index.html, DESIGN.md, API.md
 *  - document skeleton: doctype, <html lang>, <title>, viewport meta
 *  - balanced <script> tags; every inline script must be syntactically valid JS
 *  - no external network references (http(s)://) in src/href/url() — templates are dependency-free
 *  - local href/src targets must exist on disk
 *  - root gallery index.html links every template; README lists every template
 * Then serves the repo over HTTP and smoke-tests every page for HTTP 200.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const templatesDir = join(root, "templates");
const errors = [];
const ok = (msg) => console.log(`  ok  ${msg}`);
const fail = (msg) => { errors.push(msg); console.error(` FAIL  ${msg}`); };

const templates = readdirSync(templatesDir).filter((d) =>
  statSync(join(templatesDir, d)).isDirectory()
);
if (templates.length < 10) fail(`only ${templates.length} templates found; minimum is 10`);
else ok(`${templates.length} templates found (minimum 10)`);

for (const name of templates) {
  const dir = join(templatesDir, name);
  for (const f of ["index.html", "DESIGN.md", "API.md"]) {
    if (!existsSync(join(dir, f))) { fail(`${name}: missing ${f}`); }
  }
  const htmlPath = join(dir, "index.html");
  if (!existsSync(htmlPath)) continue;
  const html = readFileSync(htmlPath, "utf8");

  if (!/^<!doctype html>/i.test(html.trim())) fail(`${name}: missing <!doctype html>`);
  if (!/<html[^>]+lang=/i.test(html)) fail(`${name}: <html> missing lang attribute`);
  if (!/<title>[^<]+<\/title>/i.test(html)) fail(`${name}: missing <title>`);
  if (!/<meta[^>]+name="viewport"/i.test(html)) fail(`${name}: missing viewport meta`);

  const opens = (html.match(/<script\b[^>]*>/gi) || []).length;
  const closes = (html.match(/<\/script>/gi) || []).length;
  if (opens !== closes) fail(`${name}: unbalanced <script> tags (${opens} open / ${closes} close)`);

  // Syntax-check every inline script.
  const scriptRe = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let m, i = 0;
  while ((m = scriptRe.exec(html)) !== null) {
    i++;
    const src = m[1].trim();
    if (!src) continue;
    try {
      new vm.Script(src, { filename: `${name}/index.html#script${i}` });
    } catch (e) {
      fail(`${name}: inline script #${i} has a JS syntax error: ${e.message}`);
    }
  }

  // No external network references.
  const extRefs = html.match(/(?:src|href)\s*=\s*["']https?:\/\/[^"']+["']|url\(\s*["']?https?:\/\//gi) || [];
  if (extRefs.length) fail(`${name}: ${extRefs.length} external network reference(s): ${extRefs[0]}…`);

  // Local link targets must exist (ignore #anchors, mailto:, tel:, data:).
  const linkRe = /(?:src|href)\s*=\s*["']([^"'#][^"']*)["']/gi;
  while ((m = linkRe.exec(html)) !== null) {
    const target = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(target)) continue;
    const clean = target.split(/[?#]/)[0];
    if (!clean) continue;
    const abs = clean.startsWith("/") ? join(root, clean) : join(dir, clean);
    if (!existsSync(abs)) fail(`${name}: broken local link "${target}"`);
  }
  ok(`${name}: files, skeleton, scripts, links`);
}

// Gallery + README coverage.
const gallery = readFileSync(join(root, "index.html"), "utf8");
const readme = readFileSync(join(root, "README.md"), "utf8");
for (const name of templates) {
  if (!gallery.includes(`templates/${name}/`)) fail(`gallery index.html does not link ${name}`);
  if (!readme.includes(`templates/${name}/`)) fail(`README.md does not list ${name}`);
}
ok("gallery and README cover all templates");

// HTTP smoke test.
const mime = { html: "text/html", md: "text/markdown", css: "text/css", js: "text/javascript", svg: "image/svg+xml", png: "image/png", ico: "image/x-icon" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const abs = join(root, p);
  if (!abs.startsWith(root) || !existsSync(abs) || statSync(abs).isDirectory()) {
    res.writeHead(404); res.end("not found"); return;
  }
  res.writeHead(200, { "content-type": mime[abs.split(".").pop()] || "application/octet-stream" });
  res.end(readFileSync(abs));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const pages = ["/", ...templates.map((t) => `/templates/${t}/`)];
for (const page of pages) {
  const res = await fetch(`http://127.0.0.1:${port}${page}`);
  const body = await res.text();
  if (res.status !== 200 || body.length < 500) fail(`HTTP smoke ${page}: status ${res.status}, ${body.length} bytes`);
  else ok(`HTTP 200 ${page} (${body.length} bytes)`);
}
server.close();

if (errors.length) {
  console.error(`\n${errors.length} validation error(s).`);
  process.exit(1);
}
console.log(`\nAll ${templates.length} templates valid.`);
