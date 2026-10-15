// Robô da prévia do Instagram: abre o perfil público num navegador de verdade (o
// Instagram não responde para servidor), pega as 12 últimas postagens e manda as
// miniaturas para a função fosco-instagram, que guarda tudo no banco do site.
//   node scripts/instagram.cjs [usuario]
// A chave do robô vem de FOSCO_ROBO_CHAVE ou de C:\Users\gabri\.supabase\fosco_robo_chave.txt.
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require('C:/Users/gabri/RaposaAnalitica/node_modules/playwright');
}
const fs = require('fs');

const FUNCAO = 'https://kqpdoyidalucsiqksjtr.supabase.co/functions/v1/fosco-instagram';
const CHAVE_PUBLICA = 'sb_publishable_fJOwnHy3XZuARp_Z0nhTRw_16yL_cpK';

function chaveDoRobo() {
  if (process.env.FOSCO_ROBO_CHAVE) return process.env.FOSCO_ROBO_CHAVE.trim();
  try {
    return fs.readFileSync('C:/Users/gabri/.supabase/fosco_robo_chave.txt', 'utf8').trim();
  } catch {
    return '';
  }
}

const numero = (t) => {
  const m = String(t || '').match(/([\d.,]+)\s*(mil|k|m)?/i);
  if (!m) return null;
  if (!m[2]) return parseInt(m[1].replace(/[.,]/g, ''), 10) || null;
  const mult = /mil|k/i.test(m[2]) ? 1000 : 1e6;
  return Math.round(parseFloat(m[1].replace(',', '.')) * mult);
};

(async () => {
  const usuario = process.argv[2] || 'foscotattoo';
  const chave = chaveDoRobo();
  if (!chave) throw new Error('sem a chave do robô');

  const nav = await playwright.chromium.launch();
  const ctx = await nav.newContext({
    viewport: { width: 1280, height: 1600 },
    locale: 'pt-BR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  });
  const p = await ctx.newPage();
  await p.goto(`https://www.instagram.com/${usuario}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForSelector('a[href*="/p/"] img, a[href*="/reel/"] img', { timeout: 30000 });
  await p.waitForTimeout(2500);

  const lidos = await p.evaluate(() => {
    const desc = document.querySelector('meta[property="og:description"], meta[name="description"]')?.content || '';
    const posts = [...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')]
      .map((a) => {
        const img = a.querySelector('img');
        const m = a.getAttribute('href').match(/\/(p|reel)\/([^/]+)/);
        return m && img ? { shortcode: m[2], tipo: m[1], src: img.currentSrc || img.src, alt: img.alt || '' } : null;
      })
      .filter(Boolean);
    return { desc, posts };
  });

  const unicos = [...new Map(lidos.posts.map((x) => [x.shortcode, x])).values()].slice(0, 12);
  if (unicos.length < 3) throw new Error(`só achei ${unicos.length} postagens (o Instagram pode ter pedido login)`);

  const posts = [];
  for (const x of unicos) {
    const r = await ctx.request.get(x.src);
    if (!r.ok()) continue;
    const autor = (x.alt.match(/(?:Photo|Video|Foto|Vídeo) (?:by|de|por) (.+?) (?:on|em) /i) || [])[1] || '';
    const data = (x.alt.match(/ (?:on|em) ([A-Za-zçé]+ \d{1,2}, \d{4})/) || [])[1];
    const quando = data ? new Date(data) : null;
    posts.push({
      shortcode: x.shortcode,
      tipo: x.tipo,
      legenda: autor.replace(/[^\p{L}\p{N} |.'-]/gu, ' ').replace(/\s+/g, ' ').trim(),
      publicado_em: quando && !isNaN(quando) ? quando.toISOString() : null,
      imagem: Buffer.from(await r.body()).toString('base64'),
    });
  }
  const seguidores = numero((lidos.desc.match(/([\d.,]+\s*(?:mil|k|m)?)\s*(?:seguidores|followers)/i) || [])[1]);
  const publicacoes = numero((lidos.desc.match(/([\d.,]+\s*(?:mil|k)?)\s*(?:publicações|posts)/i) || [])[1]);
  await nav.close();

  const r = await fetch(FUNCAO, {
    method: 'POST',
    headers: { apikey: CHAVE_PUBLICA, 'Content-Type': 'application/json', 'x-fosco-robo': chave },
    body: JSON.stringify({ posts, perfil: { seguidores, publicacoes } }),
  });
  const resposta = await r.text();
  console.log(r.status, resposta, `· ${posts.length} postagens · ${seguidores ?? '?'} seguidores`);
  if (!r.ok) process.exit(1);
})().catch((e) => {
  console.error('FALHOU:', e.message);
  process.exit(1);
});
