// Static site build.
// 1. Bundles src/scripts and src/styles with esbuild (minified, code-split, content-hashed).
// 2. Renders src/pages/*.mjs into docs/ with the hashed asset paths.
// 3. Copies public/ and writes sitemap.xml and robots.txt.
// docs/ is committed, so the site opens with Live Server or GitHub Pages without a build step.
// Usage: node build.mjs                    one-off production build
//        node build.mjs --watch --serve    rebuild on change and serve docs/ on :4173
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'docs');
const watching = process.argv.includes('--watch');
// The 404 page is served at arbitrary URLs, so it needs absolute links.
const basePath = process.env.BASE_PATH ?? '/';
const pageModules = ['home', 'how-it-works', 'pricing', 'eligibility', 'start', 'login', 'portal', 'faq', 'contact', 'legal', 'not-found'];

const bundle = async () => {
  const result = await esbuild.build({
    absWorkingDir: here,
    entryPoints: { site: 'src/scripts/main.js', styles: 'src/styles/main.css' },
    outdir: join(out, 'assets/build'),
    bundle: true,
    splitting: true,
    format: 'esm',
    minify: true,
    target: ['es2020', 'chrome105', 'firefox110', 'safari15.4'],
    entryNames: '[name]-[hash]',
    chunkNames: 'chunks/[name]-[hash]',
    // Fonts and images are copied from public/ as they are.
    external: ['*.woff2', '*.webp', '*.png', '*.svg'],
    legalComments: 'none',
    metafile: true,
    logLevel: 'warning',
  });
  // Dynamic-import chunks also carry an entryPoint, so match our two entries exactly.
  const entries = { 'src/scripts/main.js': 'js', 'src/styles/main.css': 'css' };
  const assets = {};
  for (const [file, info] of Object.entries(result.metafile.outputs)) {
    const key = entries[info.entryPoint];
    if (key && !file.endsWith('.map')) assets[key] = relative(out, join(here, file)).split('\\').join('/');
  }
  if (!assets.js || !assets.css) throw new Error(`Bundle outputs missing: ${JSON.stringify(assets)}`);
  return assets;
};

const rootFor = (path) => {
  if (path === '404.html') return basePath;
  const depth = path.split('/').filter(Boolean).length;
  return depth === 0 ? './' : '../'.repeat(depth);
};

// Fresh imports on every rebuild in watch mode.
const load = (rel) => import(`${pathToFileURL(join(here, rel)).href}?v=${Date.now()}`);

const build = async () => {
  const started = performance.now();
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await cp(join(here, 'public'), out, { recursive: true });
  const assets = await bundle();

  const { layout } = await load('src/layout.mjs');
  const { site } = await load('src/data.mjs');
  const sitemapPaths = [];
  for (const name of pageModules) {
    const mod = await load(`src/pages/${name}.mjs`);
    // A module renders one page (meta + render) or several (pages: [{ meta, render }]).
    for (const { meta, render } of mod.pages ?? [{ meta: mod.meta, render: mod.render }]) {
      const root = rootFor(meta.path);
      const page = render(root);
      const html = layout({ ...meta, ...page, root, assets });
      const file = meta.path.endsWith('.html') ? join(out, meta.path) : join(out, meta.path, 'index.html');
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, html);
      if (!meta.noindex) sitemapPaths.push(meta.path);
    }
  }
  await writeFile(
    join(out, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapPaths
      .map((p) => `  <url><loc>${site.url}/${p}</loc></url>`)
      .join('\n')}\n</urlset>\n`,
  );
  await writeFile(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
  console.log(`Built ${sitemapPaths.length} indexed pages in docs/ (${Math.round(performance.now() - started)} ms): ${assets.js}, ${assets.css}`);
};

const run = async () => {
  await build();
  if (!watching) return;
  let timer;
  const rebuild = () => {
    clearTimeout(timer);
    timer = setTimeout(() => build().catch((err) => console.error(err.message)), 120);
  };
  for (const dir of ['src', 'public']) watch(join(here, dir), { recursive: true }, rebuild);
  console.log('Watching src/ and public/ for changes...');
  if (process.argv.includes('--serve')) await import('./scripts/serve.mjs');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
