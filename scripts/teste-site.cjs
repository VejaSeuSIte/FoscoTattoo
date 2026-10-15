// Teste de ponta a ponta no navegador: node scripts/teste-site.cjs <url-base> <cpf-indicador> <codigo-indicador> <cpf-admin-teste>
// Cadastra por indicação, entra, pede orçamento com foto e usa o painel (com uma conta de teste
// que precisa estar em fosco_admins). Imprime o que conferir e as contas criadas, para apagar depois.
const { chromium } = require('C:/Users/gabri/RaposaAnalitica/node_modules/playwright');
const path = require('path');
const SAIDA = 'C:/Users/gabri/AppData/Local/Temp/claude/C--Users-gabri/d0ad863a-2f9a-4b58-95c1-6385c04e82c2/scratchpad/fotos/';

function cpf() {
  const d = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  for (const t of [9, 10]) {
    let s = 0;
    for (let i = 0; i < t; i++) s += d[i] * (t + 1 - i);
    d.push(((s * 10) % 11) % 10);
  }
  return d.join('');
}
const SUF = ['Alecrim','Baobá','Cedro','Damasco','Ébano','Figo'][Math.floor(Math.random()*6)] + Math.floor(Math.random()*90+10);
const NOME = 'Teste Gama ' + SUF;
const zap = () => '8198' + String(Math.floor(Math.random() * 1e7)).padStart(7, '0');

(async () => {
  const [, , base, , codigo, cpfAdmin] = process.argv;
  const nav = await chromium.launch();
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push('JS: ' + e.message));
  p.on('response', (r) => r.status() >= 400 && !r.url().includes('_rsc') && erros.push(r.status() + ' ' + r.url()));
  const ok = (m) => console.log('✓', m);

  // 1. início
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  const quadros = await p.locator('#equipe .quadro').count();
  const ingressos = await p.locator('#vagas article').count();
  ok(`início: ${quadros} quadros na equipe, ${ingressos} vagas`);

  // 2. cadastro por indicação
  const novoCpf = cpf();
  const novoZap = zap();
  await p.goto(`${base}/cadastro/?i=${codigo}`, { waitUntil: 'networkidle' });
  await p.waitForSelector('text=te chamou pro Fosco', { timeout: 10000 });
  ok('convite mostra quem indicou');
  await p.fill('#nome', NOME);
  await p.fill('#cpf', novoCpf);
  await p.fill('#whatsapp', novoZap);
  await p.fill('#nascimento', '1998-10-15');
  await p.fill('#senha', 'teste123');
  await p.locator('input[type=checkbox]').nth(0).check();
  await p.locator('input[type=checkbox]').nth(1).check();
  await p.click('button[type=submit]');
  await p.waitForURL(/minha-area/, { timeout: 20000 });
  await p.waitForSelector('text=E aí, Teste', { timeout: 15000 });
  const link = await p.locator('.font-mono.text-ambar-claro').first().textContent();
  ok(`cadastro feito e caiu na área; link: ${link}`);
  await p.screenshot({ path: SAIDA + 'e2e-minha-area.png', fullPage: true });

  // 3. sair e entrar de novo
  await p.click('text=Sair');
  await p.waitForURL(/entrar/);
  await p.fill('#cpf', novoCpf);
  await p.fill('#senha', 'teste123');
  await p.click('button[type=submit]');
  await p.waitForSelector('text=E aí, Teste', { timeout: 15000 });
  ok('entrou de novo com CPF e senha');

  // 4. orçamento com foto (logado: nome e zap já vêm preenchidos)
  await p.goto(base + '/orcamento/', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => document.querySelector('#nome')?.value.length > 0, null, { timeout: 10000 });
  await p.fill('#ideia', 'Teste automático: uma carpa no antebraço, traço fino.');
  await p.click('text=Antebraço');
  await p.click('text=10 a 15 cm');
  await p.setInputFiles('input[type=file]', path.resolve(__dirname, '../public/equipe/03.webp'));
  await p.click('button[type=submit]');
  await p.waitForSelector('text=Recebido', { timeout: 20000 });
  ok('orçamento enviado com foto');
  await p.click('text=Voltar pro início').catch(() => {});

  // 5. painel com a conta de teste
  await p.goto(base + '/minha-area/', { waitUntil: 'networkidle' });
  await p.click('text=Sair').catch(() => {});
  const pc = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const a = await pc.newPage();
  a.on('pageerror', (e) => erros.push('JS painel: ' + e.message));
  a.on('dialog', (d) => d.accept());
  await a.goto(base + '/painel/', { waitUntil: 'networkidle' });
  await a.fill('#p-email', `${cpfAdmin}@fosco.cliente`);
  await a.fill('#p-senha', 'teste123');
  await a.click('button[type=submit]');
  await a.waitForSelector('text=Registrar sessão', { timeout: 15000 });
  ok('painel abriu');
  await a.screenshot({ path: SAIDA + 'e2e-painel-inicio.png', fullPage: true });

  await a.click('aside >> text=Clientes');
  await a.fill('input[placeholder^="Buscar"]', SUF);
  await a.click('text=' + NOME);
  await a.waitForSelector('text=Indicado por', { timeout: 10000 });
  ok('detalhe do cliente abriu, com quem indicou');
  await a.click('[role=dialog] >> text=Registrar sessão');
  await a.fill('#s-valor', '500');
  await a.fill('#s-desc', 'teste automático');
  await a.locator('[role=dialog] form:has(#s-valor) button[type=submit]').click();
  await a.waitForSelector('text=Sessão registrada', { timeout: 10000 });
  ok('sessão registrada pelo painel');
  await a.screenshot({ path: SAIDA + 'e2e-painel-cliente.png' });
  await a.keyboard.press('Escape');

  await a.click('aside >> text=Orçamentos');
  await a.waitForSelector('text=' + NOME, { timeout: 10000 });
  await a.click('text=Teste automático: uma carpa');
  await a.waitForSelector('img[alt=Referência]', { timeout: 10000 });
  ok('orçamento aparece no painel com a foto de referência');
  await a.screenshot({ path: SAIDA + 'e2e-painel-orcamento.png', fullPage: true });

  await a.click('aside >> text=Mensagens');
  await a.waitForSelector('text=Modelos de mensagem');
  ok('mensagens abriu');
  await a.screenshot({ path: SAIDA + 'e2e-painel-mensagens.png', fullPage: true });

  await a.click('aside >> text=Vitrine');
  await a.waitForSelector('text=Adicionar artista');
  ok('vitrine abriu');
  await a.screenshot({ path: SAIDA + 'e2e-painel-vitrine.png' });

  await a.click('aside >> text=Ajustes');
  await a.waitForSelector('text=(você)', { timeout: 15000 });
  ok('ajustes abriu e listou a equipe (função do servidor ok)');

  // cadastro pelo estúdio
  await a.click('aside >> text=Clientes');
  await a.click('main >> text=Cadastrar cliente');
  const cpfEstudio = cpf();
  await a.fill('#n-nome', 'Teste Delta Estudio');
  await a.fill('#n-cpf', cpfEstudio);
  await a.fill('#n-zap', zap());
  await a.click('text=Cadastrar e gerar senha');
  await a.waitForSelector('text=Senha gerada', { timeout: 15000 });
  ok('cliente cadastrado pelo estúdio, senha gerada');

  console.log('CRIADOS', JSON.stringify({ cpfs: [novoCpf, cpfEstudio] }));
  console.log(erros.length ? 'ERROS:\n' + erros.join('\n') : 'sem erros no navegador');
  await nav.close();
})().catch((e) => {
  console.error('FALHOU:', e.message);
  process.exit(1);
});
