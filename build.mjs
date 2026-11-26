// Zero-dependency static site build: renders src/pages/*.mjs into docs/ and copies public/.
// docs/ is committed, so the site opens with Live Server or GitHub Pages without a build step.
// Pages use relative links, so docs/ works from any host or sub-path.
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { layout } from './src/layout.mjs';
import { site } from './src/data.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'docs');
// The 404 page is served at arbitrary URLs, so it needs absolute links.
const basePath = process.env.BASE_PATH ?? '/';

const pageModules = ['home', 'how-it-works', 'pricing', 'eligibility', 'faq', 'contact', 'not-found'];

const rootFor = (path) => {
  if (path === '404.html') return basePath;
  const depth = path.split('/').filter(Boolean).length;
  return depth === 0 ? './' : '../'.repeat(depth);
};

const build = async () => {
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await cp(join(here, 'public'), out, { recursive: true });

  const sitemapPaths = [];
  for (const name of pageModules) {
    const mod = await import(`./src/pages/${name}.mjs`);
    const { meta } = mod;
    const root = rootFor(meta.path);
    const { body, schema, bodyClass } = mod.render(root);
    let html = layout({ root, path: meta.path, title: meta.title, description: meta.description, active: meta.active, body, schema, bodyClass });
    if (meta.noindex) html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex">');
    const file = meta.path.endsWith('.html') ? join(out, meta.path) : join(out, meta.path, 'index.html');
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
    if (!meta.noindex) sitemapPaths.push(meta.path);
    console.log(`  built ${file.replace(`${here}/`, '')}`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths.map((p) => `  <url><loc>${site.url}/${p}</loc></url>`).join('\n')}
</urlset>
`;
  await writeFile(join(out, 'sitemap.xml'), sitemap);
  await writeFile(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
  console.log(`Done: ${pageModules.length} pages in docs/`);
};

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
