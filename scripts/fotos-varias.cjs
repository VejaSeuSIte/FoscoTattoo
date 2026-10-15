// node scripts/fotos-varias.cjs base caminho1 caminho2 ...  (tira foto no computador e no celular)
const { chromium } = require('C:/Users/gabri/RaposaAnalitica/node_modules/playwright');
const SAIDA = 'C:/Users/gabri/AppData/Local/Temp/claude/C--Users-gabri/d0ad863a-2f9a-4b58-95c1-6385c04e82c2/scratchpad/fotos/';
(async () => {
  const [, , base, ...caminhos] = process.argv;
  const nav = await chromium.launch();
  for (const [nome, vw, vh, mobile] of [['pc', 1440, 900, false], ['cel', 390, 844, true]]) {
    const ctx = await nav.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    for (const c of caminhos) {
      const p = await ctx.newPage();
      const erros = [];
      p.on('pageerror', (e) => erros.push(e.message));
      p.on('response', (r) => r.status() >= 400 && !r.url().includes('_rsc') && erros.push(r.status() + ' ' + r.url()));
      await p.goto(base + c, { waitUntil: 'networkidle' });
      await p.waitForTimeout(900);
      const h = await p.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < h; y += vh / 2) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(150); }
      await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(600);
      const arq = c.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'inicio';
      await p.screenshot({ path: `${SAIDA}${arq}-${nome}.png`, fullPage: true });
      console.log(nome, c, h, erros.length ? 'ERROS: ' + erros.join(' | ') : 'ok');
      await p.close();
    }
    await ctx.close();
  }
  await nav.close();
})();
