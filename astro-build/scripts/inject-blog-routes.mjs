import fs from 'fs';
import path from 'path';

const configPath = path.join(process.cwd(), '.vercel/output/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Add /blog/* rewrites at the beginning of routes
config.routes.unshift(
  { src: '^/blog$', dest: '/' },
  { src: '^/blog/(.*)$', dest: '/$1' }
);

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('Injected /blog routes into config.json');
