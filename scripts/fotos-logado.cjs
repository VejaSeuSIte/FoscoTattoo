// Fotos de tela das áreas com login, no celular: node scripts/fotos-logado.cjs <url-base> <cpf> <senha>
const { chromium } = require('C:/Users/gabri/RaposaAnalitica/node_modules/playwright');
const SAIDA = 'C:/Users/gabri/AppData/Local/Temp/claude/C--Users-gabri/d0ad863a-2f9a-4b58-95c1-6385c04e82c2/scratchpad/fotos/';
(async () => {
  const [, , base, cpf, senha] = process.argv;
  const nav = await chromium.launch();
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  await p.goto(base + '/entrar/', { waitUntil: 'networkidle' });
  await p.fill('#cpf', cpf);
  await p.fill('#senha', senha);
  await p.click('button[type=submit]');
  await p.waitForSelector('text=E aí', { timeout: 15000 });
  await p.waitForTimeout(1500);
  const larg = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  console.log('minha área: largura da página', larg[0], 'tela', larg[1]);
  await p.screenshot({ path: SAIDA + 'logado-area-cel.png', fullPage: true });

  await p.goto(base + '/painel/', { waitUntil: 'networkidle' });
  await p.fill('#p-email', `${cpf}@fosco.cliente`).catch(() => {});
  if (await p.locator('#p-email').count()) {
    await p.fill('#p-senha', senha);
    await p.click('button[type=submit]');
  }
  await p.waitForSelector('text=Registrar sessão', { timeout: 15000 });
  for (const aba of ['Início', 'Clientes', 'Mensagens', 'Vitrine']) {
    await p.locator('nav.fixed >> text=' + aba).click();
    await p.waitForTimeout(1200);
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    console.log('painel', aba, 'largura', w);
    await p.screenshot({ path: `${SAIDA}logado-painel-${aba.normalize('NFD').replace(/[^a-z]/gi, '')}-cel.png` });
  }
  console.log(erros.length ? 'ERROS: ' + erros.join(' | ') : 'sem erros');
  await nav.close();
})().catch((e) => {
  console.error('FALHOU', e.message);
  process.exit(1);
});
