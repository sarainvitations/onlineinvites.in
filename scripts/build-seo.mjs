import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

// Reuse typed source records without requiring an extra runtime dependency.
const temporary = await fs.mkdtemp(path.join(os.tmpdir(), "online-invites-build-"));
async function compile(source, name) {
  const code = await fs.readFile(source, "utf8");
  const output = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  const file = path.join(temporary, `${name}.mjs`);
  await fs.writeFile(file, output.replace('"./premiumTemplates"', '"./premiumTemplates.mjs"').replace('"./demoEvent"', '"./demoEvent.mjs"'));
  return import(pathToFileURL(file).href);
}
const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
try {
  await compile("src/data/demoEvent.ts", "demoEvent");
  await compile("src/data/premiumTemplates.ts", "premiumTemplates");
  const { templates } = await compile("src/data/templates.ts", "templates");
  const { site } = await compile("src/config/site.ts", "site");
  const { securityHeaders } = await compile("server/security.ts", "security");
  const pages = JSON.parse(await fs.readFile("src/data/sitePages.json", "utf8"));
  const routes = [...pages, ...templates.map((template) => ({
    path: `/designs/${template.id}`,
    title: `${template.name} — ${template.category} ${template.premium ? "invitation" : "demo"}`,
    description: template.description,
    index: true,
  }))];
  const base = await fs.readFile("dist/index.html", "utf8");
  // Metadata is present in the actual HTTP HTML for crawlers that do not run JS.
  const clean = base.replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)"[^>]*>/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>/gi, "");
  function documentFor(route) {
    const title = `${route.title} | ${site.name}`;
    const url = site.origin + route.path;
    const image = `${site.origin}${route.image ?? "/social-card.png"}`;
    const tags = `<title>${escape(title)}</title><meta name="description" content="${escape(route.description)}"><meta name="robots" content="${route.index ? "index, follow" : "noindex, follow"}"><link rel="canonical" href="${escape(url)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(route.description)}"><meta property="og:type" content="website"><meta property="og:site_name" content="Online Invites"><meta property="og:url" content="${escape(url)}"><meta property="og:image" content="${escape(image)}"><meta property="og:image:width" content="${route.imageWidth ?? 1200}"><meta property="og:image:height" content="${route.imageHeight ?? 630}"><meta property="og:image:alt" content="${escape(route.imageAlt ?? "Online Invites — Every celebration deserves a beautiful invitation")}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(route.description)}"><meta name="twitter:image" content="${escape(image)}">`;
    const fallback = `<noscript><div style="padding:32px;font:18px/1.6 system-ui;max-width:800px;margin:auto"><h1>${escape(route.title)}</h1><p>${escape(route.description)}</p><p>Enable JavaScript to browse the interactive invitations and quotation form.</p></div></noscript>`;
    return clean.replace("</head>", `${tags}</head>`).replace("</body>", `${fallback}</body>`);
  }
  for (const route of routes) {
    const directory = route.path === "/" ? "dist" : `dist${route.path}`;
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, "index.html"), documentFor(route));
  }
  await fs.writeFile("dist/404.html", documentFor({ path: "/404", title: "Page not found", description: "Return to Online Invites to explore digital invitation designs.", index: false }));
  const urls = routes.filter((route) => route.index).map((route) => `  <url><loc>${escape(site.origin + route.path)}</loc></url>`).join("\n");
  await fs.writeFile("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  await fs.writeFile("dist/robots.txt", `User-agent: *\nDisallow: /api/\nSitemap: ${site.origin}/sitemap.xml\n`);
  // Cloudflare applies _headers only to static responses; API JSON sets its own.
  const headerText = Object.entries(securityHeaders).map(([key, value]) => `  ${key}: ${value}`).join("\n");
  await fs.writeFile("dist/_headers", `/*\n${headerText}\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/fonts/*.woff2\n  Cache-Control: public, max-age=31536000, immutable\n`);
  await fs.writeFile("dist/_redirects", `${routes.filter((route) => route.path !== "/").map((route) => `${route.path} ${route.path}/index.html 200`).join("\n")}\n`);
  console.log(`Generated metadata for ${routes.length} routes, sitemap, robots, 404 and security headers.`);
} finally {
  await fs.rm(temporary, { recursive: true, force: true });
}
