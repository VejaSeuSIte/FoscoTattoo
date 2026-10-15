// Gera as imagens de prévia de link (WhatsApp, Instagram): public/og/fosco.jpg e convite.jpg
const { chromium } = require('C:/Users/gabri/RaposaAnalitica/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const raiz = path.resolve(__dirname, '..');
const uri = (f, tipo) => `data:${tipo};base64,${fs.readFileSync(path.join(raiz, f)).toString('base64')}`;
const tijolo = uri('public/textura/tijolos.svg', 'image/svg+xml');
const foto = (n) => uri(`public/equipe/0${n}.webp`, 'image/webp');
const marca = fs.readFileSync(path.join(raiz, 'public/favicon.svg'), 'utf8').match(/<g[\s\S]*<\/g>/)[0].replace(/transform="[^"]*"/, '');

const base = (miolo, luz = '74% 40%') => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Grenze+Gotisch:wght@600;700;800&family=Archivo:wght@500;700&family=IBM+Plex+Mono:wght@500&display=block" rel="stylesheet">
<style>
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;overflow:hidden;background:#100b08 url('${tijolo}');background-size:420px auto;font-family:Archivo;color:#ebdfc7;position:relative}
body:before{content:'';position:absolute;inset:0;background:radial-gradient(70% 95% at ${luz},rgba(10,6,3,.12),rgba(10,6,3,.62) 45%,rgba(8,5,3,.96) 82%)}
body:after{content:'';position:absolute;inset:0;background:radial-gradient(45% 60% at ${luz},rgba(240,168,92,.30),transparent 70%);mix-blend-mode:screen}
.led{position:absolute;left:0;right:0;bottom:0;height:4px;background:linear-gradient(90deg,transparent,#f2b46a 20%,#ffd08f 50%,#f2b46a 80%,transparent);box-shadow:0 0 30px 8px rgba(242,160,70,.45);z-index:5}
.c{position:absolute;inset:0;z-index:2}
.k{font-family:'IBM Plex Mono';font-size:17px;letter-spacing:.3em;text-transform:uppercase;color:#c9b996}
.t{font-family:'Grenze Gotisch';font-weight:700;line-height:.9}
.q{position:absolute;padding:9px;background:linear-gradient(145deg,#2a1e16,#120c08 60%,#1d140e);border-radius:3px;filter:drop-shadow(0 22px 26px rgba(0,0,0,.8))}
.q div{padding:7px;background:#d9caa9}.q img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;object-position:50% 14%;filter:brightness(.92)}
.b{display:inline-block;margin-top:30px;padding:16px 30px;border-radius:999px;background:linear-gradient(180deg,#e3a35d,#c98339);color:#1a0f07;font-weight:700;font-size:24px}
svg{fill:#ebdfc7}
</style></head><body><div class="c">${miolo}</div><div class="led"></div></body></html>`;

const site = base(`
<div style="position:absolute;left:80px;top:120px">
  <div class="k">estúdio privado · recife — pe</div>
  <div class="t" style="font-size:190px;margin-top:22px">Fosco</div>
  <div class="t" style="font-size:40px;font-weight:600;color:#c9b996;margin-top:6px">arte · tattoo · piercing</div>
  <div style="font-size:24px;color:#c9b996;margin-top:26px">Orçamento, vagas do mês e indique e ganhe</div>
</div>
<div class="q" style="left:660px;top:150px;width:150px;transform:rotate(-4deg)"><div><img src="${foto(2)}"></div></div>
<div class="q" style="left:820px;top:110px;width:180px;transform:rotate(1.5deg)"><div><img src="${foto(1)}"></div></div>
<div class="q" style="left:1010px;top:160px;width:150px;transform:rotate(4deg)"><div><img src="${foto(4)}"></div></div>`);

const convite = base(`
<div style="position:absolute;left:80px;top:96px;width:700px">
  <div class="k">convite · fosco tattoo studio</div>
  <div class="t" style="font-size:112px;margin-top:20px">Bora tatuar<br>no <span style="color:#d4914a">Fosco?</span></div>
  <div style="font-size:26px;line-height:1.4;color:#c9b996;margin-top:24px">Cadastre-se pelo link e ganhe o seu.<br>Cada amigo que entrar vira desconto na sua tattoo.</div>
  <div class="b">até 50% de desconto</div>
</div>
<svg viewBox="0 0 100 372" style="position:absolute;right:120px;top:70px;height:480px;filter:drop-shadow(0 10px 40px rgba(240,160,80,.35))">${marca}</svg>`, '82% 45%');

(async () => {
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 1200, height: 630 } });
  for (const [nome, html] of [['fosco', site], ['convite', convite]]) {
    await p.setContent(html, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(raiz, `public/og/${nome}.jpg`), type: 'jpeg', quality: 88 });
    console.log('ok', nome);
  }
  // ícone para a tela inicial do celular
  await p.setViewportSize({ width: 180, height: 180 });
  await p.setContent(`<html><body style="margin:0;background:#0b0806;display:flex;align-items:center;justify-content:center;height:180px"><svg viewBox="0 0 100 372" style="height:150px;fill:#ebdfc7">${marca}</svg></body></html>`);
  await p.screenshot({ path: path.join(raiz, 'public/icone-180.png') });
  await nav.close();
})();
