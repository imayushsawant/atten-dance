import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('public root is independent of session',()=>{
  const app=read('src/App.tsx');
  const root=app.match(/function RootRoute\(\) \{[\s\S]*?\n\}/)?.[0];
  assert.ok(root?.includes('return <LandingPage />'));
  assert.doesNotMatch(root,/useSession|LoadingScreen/);
  assert.match(app,/function ProtectedRoute[\s\S]*?useSession\(\)/);
  assert.match(read('server/middleware/auth.ts'),/auth\.api\.getSession/);
  assert.match(read('server/auth.ts'),/cookieCache: \{ enabled: true, maxAge: 60 \}/);
});
test('cookie redirects are temporary and limited to root',()=>{
  const v=JSON.parse(read('vercel.json'));
  assert.equal(v.redirects.length,2);
  for(const rule of v.redirects){assert.equal(rule.source,'/');assert.equal(rule.destination,'/dashboard');assert.equal(rule.permanent,false);assert.equal(rule.has[0].type,'cookie');}
  assert.ok(v.rewrites.some(r=>r.source==='/dashboard'&&r.destination==='/app-shell.html'));
  assert.ok(!v.rewrites.some(r=>r.source.includes('(?!assets')));
});
test('sitemap and robots declare public canonical domain',()=>{
  assert.match(read('public/robots.txt'),/Sitemap: https:\/\/canibunk\.in\/sitemap\.xml/);
  const sitemap=read('public/sitemap.xml');
  assert.equal((sitemap.match(/<loc>/g)||[]).length,5);
  assert.match(read('index.html'),/rel="canonical" href="https:\/\/canibunk\.in\/"/);
});
