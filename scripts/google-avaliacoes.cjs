// Avaliações do Google do Fosco: abre o lugar no Google Maps (sem login), vai para a aba
// de avaliações, rola até carregar todas, abre os «Mais» e guarda nome, foto, estrelas,
// quando, texto e até 3 fotos de cada uma. As imagens ficam em public/avaliacoes/ e os
// dados em src/data/avaliacoes.json (o site lê na montagem). Rode de vez em quando:
//   node scripts/google-avaliacoes.cjs
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require('C:/Users/gabri/RaposaAnalitica/node_modules/playwright');
}
const fs = require('fs');
const path = require('path');

const LUGAR =
  'https://www.google.com/maps/place/Fosco+Tattoo+Studio/@-8.0418154,-34.9334011,17z/data=!3m1!4b1!4m6!3m5!1s0x7ab19f57bb9e755:0x769bbc1ec87f8e71!8m2!3d-8.0418154!4d-34.9308262!16s%2Fg%2F11mlsdwp8t';
const raiz = path.resolve(__dirname, '..');
const PASTA_IMG = path.join(raiz, 'public/avaliacoes');
const ARQ_DADOS = path.join(raiz, 'src/data/avaliacoes.json');

// «3 meses atrás», «uma semana atrás», «2 anos atrás» -> data aproximada
function dataAproximada(rel, agora = new Date()) {
  const t = rel.toLowerCase();
  const n = /\b(um|uma)\b/.test(t) ? 1 : parseInt(t, 10) || 1;
  const d = new Date(agora);
  if (/hora|minuto/.test(t)) return d.toISOString();
  if (/dia/.test(t)) d.setDate(d.getDate() - n);
  else if (/semana/.test(t)) d.setDate(d.getDate() - 7 * n);
  else if (/m[eê]s/.test(t)) d.setMonth(d.getMonth() - n);
  else if (/ano/.test(t)) d.setFullYear(d.getFullYear() - n);
  return d.toISOString();
}

(async () => {
  const nav = await playwright.chromium.launch({ channel: 'msedge' });
  const ctx = await nav.newContext({ viewport: { width: 1300, height: 950 }, locale: 'pt-BR' });
  const p = await ctx.newPage();
  await p.goto(LUGAR + '?hl=pt-BR', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(4500);
  const resumo = await p.evaluate(() => {
    const t = document.querySelector('div[role="main"]')?.innerText || '';
    const nota = (t.match(/\n(\d,\d)\n\((\d+)\)/) || []).slice(1);
    return { nota: nota[0] ? Number(nota[0].replace(',', '.')) : null, total: nota[1] ? Number(nota[1]) : null };
  });
  await p.locator('button[role="tab"]').filter({ hasText: /Avalia/ }).first().click({ timeout: 10000 });
  await p.waitForTimeout(3500);

  // Sem login, o Maps mostra poucas avaliações por lista. Então lê a lista em várias
  // ordens, em cada filtro de assunto e em buscas por palavra, e junta tudo sem repetir.
  const todas = new Map();
  const ler = async () => {
    for (const b of await p.locator('div.jftiEf button.w8nwRe').all()) await b.click({ timeout: 1500 }).catch(() => {});
    await p.waitForTimeout(500);
    const lidas = await p.$$eval('div.jftiEf[data-review-id]', (l) =>
      l.map((r) => ({
        id: r.getAttribute('data-review-id'),
        nome: r.querySelector('.d4r55')?.innerText.trim() || '',
        foto: r.querySelector('img.NBa7we')?.src || '',
        nota: parseInt(r.querySelector('.kvMYJc')?.getAttribute('aria-label') || '0', 10),
        quando: r.querySelector('.rsqaWe')?.innerText.trim() || '',
        texto: r.querySelector('.wiI7pd')?.innerText.trim() || '',
        fotos: [...r.querySelectorAll('button.Tya61d')].map((b) => (b.style.backgroundImage.match(/url\("?(.*?)"?\)/) || [])[1]).filter(Boolean),
      }))
    );
    for (const r of lidas) {
      const ja = todas.get(r.id);
      if (!ja || r.texto.length > ja.texto.length || r.fotos.length > ja.fotos.length) todas.set(r.id, r);
    }
  };
  await ler();
  for (const ordem of ['Mais recentes', 'Classificação mais alta', 'Classificação mais baixa', 'Mais relevantes']) {
    await p.locator('button[aria-label="Classificar avaliações"]').first().click({ timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(1200);
    await p.getByText(ordem, { exact: true }).last().click({ timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(2500);
    await ler();
  }
  const filtros = await p.$$eval('button.e2moi[role="radio"]', (l) => l.map((b) => b.getAttribute('aria-label')).filter((a) => a && !/^Todas/.test(a)));
  for (const f of filtros) {
    await p.locator(`button.e2moi[aria-label="${f}"]`).first().click({ timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(2500);
    await ler();
  }
  await p.locator('button.e2moi[aria-label^="Todas"]').first().click({ timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(1500);
  for (const palavra of ['tatuagem', 'tattoo', 'piercing', 'atendimento', 'trabalho', 'artista', 'recomendo', 'excelente', 'profissional', 'estúdio', 'amei', 'voltar', 'top', 'perfeito', 'cuidado', 'lindo', 'atencioso', 'preço']) {
    await p.locator('button[aria-label="Pesquisar avaliações"]').first().click({ timeout: 4000 }).catch(() => {});
    await p.waitForTimeout(700);
    const campo = p.locator('input:visible:not(#searchboxinput)').last();
    await campo.fill(palavra, { timeout: 4000 }).catch(() => {});
    await campo.press('Enter').catch(() => {});
    await p.waitForTimeout(2500);
    await ler();
  }
  const unicas = [...todas.values()];
  console.log('avaliações lidas:', unicas.length, '· nota', resumo.nota, '·', resumo.total, 'no total');

  // baixa as imagens (foto da pessoa e até 3 fotos da avaliação)
  fs.mkdirSync(PASTA_IMG, { recursive: true });
  for (const f of fs.readdirSync(PASTA_IMG)) fs.unlinkSync(path.join(PASTA_IMG, f));
  const baixar = async (url, nome) => {
    const r = await ctx.request.get(url).catch(() => null);
    if (!r || !r.ok()) return '';
    fs.writeFileSync(path.join(PASTA_IMG, nome), await r.body());
    return `avaliacoes/${nome}`;
  };
  const agora = new Date();
  const avaliacoes = [];
  for (const [i, r] of unicas.entries()) {
    const n = String(i + 1).padStart(2, '0');
    const foto = r.foto ? await baixar(r.foto.replace(/=w\d+-h\d+[^&]*/, '=w120-h120-p-rp-mo-br100'), `${n}-pessoa.jpg`) : '';
    const fotos = [];
    for (const [j, u] of r.fotos.slice(0, 3).entries()) {
      const c = await baixar(u.replace(/=w\d+-h\d+[^&]*/, '=w640-h800-p-k-no'), `${n}-foto${j + 1}.jpg`);
      if (c) fotos.push(c);
    }
    avaliacoes.push({ nome: r.nome, foto, nota: r.nota, quando: dataAproximada(r.quando, agora), texto: r.texto, fotos });
  }
  fs.mkdirSync(path.dirname(ARQ_DADOS), { recursive: true });
  fs.writeFileSync(
    ARQ_DADOS,
    JSON.stringify({ nota: resumo.nota, total: resumo.total, url: LUGAR, atualizado_em: agora.toISOString().slice(0, 10), avaliacoes }, null, 1) + '\n'
  );
  console.log('com texto:', avaliacoes.filter((a) => a.texto).length, '· com foto:', avaliacoes.filter((a) => a.fotos.length).length);
  await nav.close();
})().catch((e) => {
  console.error('FALHOU:', e.message);
  process.exit(1);
});
