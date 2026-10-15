// Servidor estático mínimo para conferir o out/ localmente: node scripts/servir.mjs [porta] [base]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
const porta = Number(process.argv[2] || 3000);
const base = process.argv[3] || '';
const raiz = new URL('../out/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const tipos = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain', '.ico': 'image/x-icon', '.mp4': 'video/mp4' };
createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (base && p.startsWith(base)) p = p.slice(base.length) || '/';
  let arq = normalize(join(raiz, p));
  try {
    if ((await stat(arq)).isDirectory()) arq = join(arq, 'index.html');
  } catch {
    arq = join(raiz, '404.html');
    res.statusCode = 404;
  }
  try {
    const dados = await readFile(arq);
    res.setHeader('Content-Type', tipos[extname(arq)] || 'application/octet-stream');
    res.end(dados);
  } catch {
    res.statusCode = 404;
    res.end('404');
  }
}).listen(porta, () => console.log(`servindo em http://localhost:${porta}${base}/`));
