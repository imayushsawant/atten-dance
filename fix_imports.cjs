const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('server');
files.push(path.resolve('api', 'index.ts'));

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  // Only replace local imports that start with '.'
  c = c.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, p1) => {
    if (p1.endsWith('.js')) return match;
    return `from '${p1}.js'`;
  });
  fs.writeFileSync(f, c);
  console.log('Fixed', f);
});
