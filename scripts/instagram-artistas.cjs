// Coleta do Instagram de cada artista, para o verso dos cartões da equipe: bio inteira,
// links e todos os destaques (a imagem maior de cada item; de vídeo, a capa).
// Os destaques só abrem com login, então usa um Brave num perfil separado
// (C:\Users\gabri\.fosco-ig\brave) onde alguém já entrou no Instagram uma vez.
// O instaloader (pip) toma bloqueio 429 do Instagram; o navegador de verdade não.
//   node scripts/instagram-artistas.cjs <pasta_saida> cram.ink fefreitas.ink ...
// Sai <pasta>/<handle>_login.json e <pasta>/<handle>/destaques/*.jpg
const { chromium } = require('C:/Users/gabri/RaposaAnalitica/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const [, , PASTA, ...handles] = process.argv;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// anda pelo JSON e chama f em cada objeto
function andar(o, f) {
  if (Array.isArray(o)) o.forEach((x) => andar(x, f));
  else if (o && typeof o === 'object') {
    f(o);
    Object.values(o).forEach((x) => andar(x, f));
  }
}

(async () => {
  const ctx = await chromium.launchPersistentContext('C:/Users/gabri/.fosco-ig/brave', {
    executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
    headless: false,
    viewport: { width: 1200, height: 900 },
    locale: 'pt-BR',
    args: ['--window-position=-2400,0'],
  });
  for (const h of handles) {
    const p = await ctx.newPage();
    const perfis = [];
    const reels = {}; // id do destaque -> itens
    const ler = (j) =>
      andar(j, (o) => {
        if (typeof o.biography === 'string' && o.username === h) perfis.push(o);
        if (Array.isArray(o.items) && typeof o.id === 'string' && o.id.startsWith('highlight:')) {
          reels[o.id] = {
            titulo: o.title || '',
            itens: o.items.map((it) => {
              const c = (it.image_versions2?.candidates || []).sort((a, b) => b.width - a.width)[0];
              return { id: it.pk || it.id, video: it.media_type === 2 || !!it.video_versions, url: c?.url, w: c?.width, h: c?.height, quando: it.taken_at };
            }),
          };
        }
      });
    p.on('response', async (r) => {
      if (!/instagram\.com\/(api|graphql)/.test(r.url())) return;
      try {
        ler(JSON.parse(await r.text()));
      } catch {}
    });
    // o primeiro destaque e o perfil vêm dentro do próprio HTML
    const lerPagina = async () => {
      const blocos = await p.evaluate(() => [...document.querySelectorAll('script[type="application/json"]')].map((s) => s.textContent).filter((t) => /image_versions2|biography/.test(t)));
      for (const b of blocos) {
        try {
          ler(JSON.parse(b));
        } catch {}
      }
    };
    try {
      await p.goto(`https://www.instagram.com/${h}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await p.waitForSelector('header', { timeout: 30000 });
      await p.waitForTimeout(4000);
      await lerPagina();
      const destaques = await p.evaluate(() =>
        [...document.querySelectorAll('a[href*="/stories/highlights/"]')].map((a) => ({ titulo: a.innerText.trim(), href: a.href }))
      );
      const topo = await p.evaluate(() => document.querySelector('header')?.innerText || '');
      // abre cada destaque (o site costuma carregar vários de uma vez)
      for (const d of destaques) {
        const id = 'highlight:' + d.href.match(/highlights\/(\d+)/)[1];
        if (reels[id]) continue;
        await p.goto(d.href, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await p.waitForTimeout(3500 + Math.random() * 1500);
        await lerPagina();
        if (!reels[id]) {
          // às vezes precisa clicar em «ver story»
          await p.getByRole('button', { name: /ver story|view story/i }).click({ timeout: 3000 }).catch(() => {});
          await p.waitForTimeout(3000);
          await lerPagina();
        }
      }
      for (const d of destaques) {
        const id = 'highlight:' + d.href.match(/highlights\/(\d+)/)[1];
        if (reels[id] && !reels[id].titulo) reels[id].titulo = d.titulo;
      }
      // baixa as imagens
      const dir = path.join(PASTA, h, 'destaques');
      fs.mkdirSync(dir, { recursive: true });
      let baixadas = 0;
      for (const [id, r] of Object.entries(reels)) {
        const pref = (r.titulo.normalize('NFKD').replace(/[^\w]/g, '') || 'x').slice(0, 14);
        for (const [i, it] of r.itens.entries()) {
          if (!it.url) continue;
          const nome = `${pref}_${id.slice(10)}_${String(i).padStart(2, '0')}${it.video ? '_v' : ''}.jpg`;
          it.arquivo = nome;
          const destino = path.join(dir, nome);
          if (fs.existsSync(destino)) continue;
          const resp = await ctx.request.get(it.url).catch(() => null);
          if (resp && resp.ok()) {
            fs.writeFileSync(destino, await resp.body());
            baixadas++;
          }
        }
      }
      const perfil = perfis[perfis.length - 1] || {};
      const saida = {
        handle: h,
        nome: perfil.full_name,
        bio: perfil.biography,
        links: perfil.bio_links || [],
        site: perfil.external_url,
        categoria: perfil.category_name,
        topo,
        destaques: destaques.map((d) => ({ ...d, ...(reels['highlight:' + d.href.match(/highlights\/(\d+)/)[1]] || { itens: [] }) })),
      };
      fs.writeFileSync(path.join(PASTA, `${h}_login.json`), JSON.stringify(saida, null, 1));
      console.log(h, '· bio', perfil.biography ? 'ok' : 'NÃO', '· destaques', destaques.length, '· com itens', Object.keys(reels).length, '· imagens novas', baixadas);
    } catch (e) {
      console.log(h, 'FALHOU', e.message.split('\n')[0]);
      await p.screenshot({ path: path.join(PASTA, `${h}_erro_login.png`) }).catch(() => {});
    }
    await p.close();
    await espera(4000 + Math.random() * 3000);
  }
  await ctx.close();
})();
