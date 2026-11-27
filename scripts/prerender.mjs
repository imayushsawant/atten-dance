import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { renderPublicPages } from '../.prerender/entry-prerender.js';

const template = await readFile('dist/index.html', 'utf8');
const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const root = '<div id="root"></div>';
if (!template.includes(root)) throw new Error('Missing root in Vite output');
const shell = template
  .replace(/<link rel="canonical"[^>]*>/, '')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')
  .replace(/<meta (?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>/g, '')
  .replace(/<title>[^<]*<\/title>/, '<title>Atten-Dance</title>')
  .replace('</head>', '<meta name="robots" content="noindex, follow" /></head>');
await writeFile('dist/app-shell.html', shell);
for (const page of renderPublicPages()) {
  let output = template.replace(root, () => '<div id="root">' + page.html + '</div>');
  if (page.path !== '/') {
    const url = 'https://canibunk.in' + page.path;
    output = output.replace(/<title>[^<]*<\/title>/, '<title>' + escape(page.title) + '</title>')
      .replace(/(<meta name="description" content=")[^"]*/, '$1' + escape(page.description))
      .replace(/(<meta property="og:title" content=")[^"]*/, '$1' + escape(page.title))
      .replace(/(<meta name="twitter:title" content=")[^"]*/, '$1' + escape(page.title))
      .replace(/(<meta property="og:description" content=")[^"]*/, '$1' + escape(page.description))
      .replace(/(<meta name="twitter:description" content=")[^"]*/, '$1' + escape(page.description))
      .replace(/(<link rel="canonical" href=")[^"]*/, '$1' + url)
      .replace(/(<meta property="og:url" content=")[^"]*/, '$1' + url)
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
    await mkdir(join('dist', page.path.slice(1)), { recursive: true });
  }
  await writeFile(join('dist', page.path.slice(1), 'index.html'), output);
}
await rm('.prerender', { recursive: true, force: true });
