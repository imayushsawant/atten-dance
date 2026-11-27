import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const paths=['','attendance-calculator','75-percent-attendance-calculator','bunk-calculator','attendance-recovery-calculator'];
const titles=new Set();
const sitemap=await readFile('dist/sitemap.xml','utf8');
for(const path of paths){
  const html=await readFile('dist/'+(path?path+'/':'')+'index.html','utf8');
  const url='https://canibunk.in/'+path;
  assert.ok(html.includes('<link rel="canonical" href="'+url+'"'));
  assert.ok(sitemap.includes('<loc>'+url+'</loc>'));
  assert.match(html,/<h1[ >]/);
  assert.doesNotMatch(html,/<div id="root"><\/div>/);
  assert.doesNotMatch(html,/<meta name="robots" content="noindex/);
  const title=html.match(/<title>([^<]+)<\/title>/)?.[1];assert.ok(title);titles.add(title);
  if(path)assert.match(html,/Classes attended/);
  else assert.match(html,/Free attendance calculators/);
}
assert.equal(titles.size,5);
const shell=await readFile('dist/app-shell.html','utf8');
assert.match(shell,/<div id="root"><\/div>/);
assert.match(shell,/name="robots" content="noindex, follow"/);
assert.doesNotMatch(shell,/<link rel="canonical"/);
assert.match(await readFile('dist/robots.txt','utf8'),/Sitemap: https:\/\/canibunk\.in\/sitemap\.xml/);
console.log('Verified 5 prerendered public documents, unique titles, canonicals, sitemap, robots and private shell.');
