// Gera as imagens de prévia de link (WhatsApp, Instagram): public/og/fosco.jpg, convite.jpg
// e cuidados.jpg, mais o ícone da tela inicial do celular (public/icone-180.png).
//   node scripts/og.cjs
const { chromium } = require('C:/Users/gabri/RaposaAnalitica/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const raiz = path.resolve(__dirname, '..');
const uri = (f, tipo) => `data:${tipo};base64,${fs.readFileSync(path.join(raiz, f)).toString('base64')}`;
const salao = uri('public/estudio/video-larga.webp', 'image/webp');
const vetores = fs.readFileSync(path.join(raiz, 'src/components/vetoresMarca.js'), 'utf8');
const pegar = (nome) => {
  const m = vetores.match(new RegExp(`${nome} = \\{ viewBox: '([^']+)', d: '([^']+)'`));
  return `<svg viewBox="${m[1]}"><path fill-rule="evenodd" d="${m[2]}"/></svg>`;
};
const logo = pegar('LOGO');

const base = (miolo) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Grenze+Gotisch:wght@700&family=Archivo:wght@500;700;800&display=block" rel="stylesheet">
<style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;background:#0b0806 url('${salao}') center/cover;font-family:Archivo;color:#ebdfc7;position:relative}
body:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,8,6,.96) 0%,rgba(11,8,6,.88) 38%,rgba(11,8,6,.45) 70%,rgba(11,8,6,.25) 100%),linear-gradient(180deg,rgba(11,8,6,.4),transparent 30%,transparent 70%,rgba(11,8,6,.6))}
.led{position:absolute;left:0;right:0;bottom:0;height:4px;background:linear-gradient(90deg,transparent,#f2b46a 20%,#ffd08f 50%,#f2b46a 80%,transparent);box-shadow:0 0 30px 8px rgba(242,160,70,.45);z-index:5}
.c{position:absolute;inset:0;z-index:2}
.k{font-size:18px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:#ecbd7c}
.t{font-weight:800;text-transform:uppercase;letter-spacing:.03em;line-height:1.05}
.g{font-family:'Grenze Gotisch';font-weight:700;line-height:.8}
.s{font-size:25px;line-height:1.45;color:#cdbd9b}
svg{fill:#ebdfc7;display:block}
</style></head><body><div class="c">${miolo}</div><div class="led"></div></body></html>`;

const site = base(`
<div style="position:absolute;left:80px;top:70px;width:380px">${logo}</div>
<div style="position:absolute;left:150px;top:400px;width:560px">
  <div class="k" style="font-size:15px;color:#a59479">tattoo &amp; piercing · recife</div>
  <div class="s" style="margin-top:14px;color:#ebdfc7;font-size:30px">Uma equipe de artistas de estilos diferentes. <span style="color:#ecbd7c">Conta sua ideia.</span></div>
</div>`);

const convite = base(`
<div style="position:absolute;left:80px;top:78px;width:760px">
  <div class="k">te indiquei o fosco</div>
  <div class="t" style="font-size:40px;margin-top:22px">faça sua 1ª indicação<br>e ganhe</div>
  <div class="g" style="font-size:200px;margin-top:10px">10%</div>
  <div class="t" style="font-size:40px;margin-top:4px">de desconto na sua tattoo</div>
  <div class="s" style="margin-top:20px">Cadastro em um minuto. Seu link sai na hora.</div>
</div>
<div style="position:absolute;right:70px;bottom:60px;width:250px;opacity:.95">${logo}</div>`);

const cuidados = base(`
<div style="position:absolute;left:80px;top:96px;width:700px">
  <div class="k">fosco tattoo studio</div>
  <div class="t" style="font-size:76px;margin-top:22px">Como cuidar<br>da sua <span style="color:#ecbd7c">tattoo</span></div>
  <div class="s" style="margin-top:26px">O que fazer e o que evitar<br>nos primeiros dias.</div>
</div>
<div style="position:absolute;right:70px;bottom:60px;width:250px;opacity:.95">${logo}</div>`);

(async () => {
  const nav = await chromium.launch({ channel: 'msedge' });
  const p = await nav.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [nome, html] of [['fosco', site], ['convite', convite], ['cuidados', cuidados]]) {
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(raiz, `public/og/${nome}.jpg`), type: 'jpeg', quality: 86 });
    console.log('ok', nome);
  }
  // ícone para a tela inicial do celular: o «f» oficial do favicon
  const icone = fs.readFileSync(path.join(raiz, 'public/favicon.svg'), 'utf8').replace('rx="14"', 'rx="0"');
  await p.setViewportSize({ width: 180, height: 180 });
  await p.setContent(`<body style="margin:0">${icone.replace('<svg ', '<svg width="180" height="180" ')}</body>`);
  await p.screenshot({ path: path.join(raiz, 'public/icone-180.png') });
  await nav.close();
})();
