// Fotos de tela para conferir o visual: node scripts/fotos.cjs <url> <prefixo> [rolar-até-o-fim]
const { chromium } = require('C:/Users/gabri/RaposaAnalitica/node_modules/playwright');
const SAIDA = 'C:/Users/gabri/AppData/Local/Temp/claude/C--Users-gabri/d0ad863a-2f9a-4b58-95c1-6385c04e82c2/scratchpad/fotos/';
(async () => {
  const [, , url, prefixo = 'tela', alturaTotal] = process.argv;
  require('fs').mkdirSync(SAIDA, { recursive: true });
  const nav = await chromium.launch();
  for (const [nome, vw, vh, mobile] of [['pc', 1440, 900, false], ['cel', 390, 844, true]]) {
    const ctx = await nav.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage();
    const erros = [];
    p.on('pageerror', (e) => erros.push(e.message));
    p.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    // rola devagar para disparar as animações de entrada
    const h = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += vh / 2) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(250); }
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(800);
    await p.screenshot({ path: `${SAIDA}${prefixo}-${nome}-topo.png` });
    if (alturaTotal) await p.screenshot({ path: `${SAIDA}${prefixo}-${nome}-inteira.png`, fullPage: true });
    console.log(nome, 'altura', h, erros.length ? 'ERROS: ' + erros.join(' | ') : 'sem erros');
    await ctx.close();
  }
  await nav.close();
})();
