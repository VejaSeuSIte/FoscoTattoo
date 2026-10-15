// Prévia do feed do Instagram do estúdio.
// O Instagram não abre o perfil para servidor, então quem busca as postagens é o
// robô (scripts/instagram.cjs, num navegador de verdade, pelo GitHub Actions ou à mão)
// e manda pra cá. Aqui as miniaturas vão para o balde «fosco» e a lista para
// fosco_instagram. Entra quem tem a chave do robô (cabeçalho x-fosco-robo) ou é admin.
import { cabecalhos, responder, servico } from '../_shared/comum.ts';

async function sha256(texto: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, '0')).join('');
}

function base64ParaBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

Deno.serve(async (req) => {
  const h = { ...cabecalhos(req), 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-fosco-robo' };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: h });
  if (req.method !== 'POST') return responder({ erro: 'Use POST.' }, 405, h);
  const db = servico();

  // quem pode mandar: o robô com a chave, ou alguém do painel
  let pode = false;
  const chave = req.headers.get('x-fosco-robo') ?? '';
  if (chave) {
    const { data } = await db.from('fosco_chaves').select('hash').eq('nome', 'instagram').maybeSingle();
    pode = !!data && data.hash === (await sha256(chave));
  } else {
    const jwt = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
    const { data: quem } = await db.auth.getUser(jwt);
    if (quem?.user) {
      const { data: adm } = await db.from('fosco_admins').select('user_id').eq('user_id', quem.user.id).maybeSingle();
      pode = !!adm;
    }
  }
  if (!pode) return responder({ erro: 'Sem permissão.' }, 403, h);

  let corpo: { posts?: any[]; perfil?: Record<string, unknown> };
  try {
    corpo = await req.json();
  } catch {
    return responder({ erro: 'Pedido inválido.' }, 400, h);
  }
  const posts = (corpo.posts ?? []).filter((p) => /^[A-Za-z0-9_-]{5,40}$/.test(String(p?.shortcode ?? ''))).slice(0, 12);
  if (!posts.length) return responder({ erro: 'Nenhuma postagem veio.' }, 400, h);

  const { data: atuais } = await db.from('fosco_instagram').select('shortcode');
  const ja = new Set((atuais ?? []).map((a) => a.shortcode));
  let novos = 0;
  const agora = new Date().toISOString();

  for (const [i, p] of posts.entries()) {
    const codigo = String(p.shortcode);
    if (p.imagem) {
      const bytes = base64ParaBytes(String(p.imagem));
      const { error } =
        bytes.length > 2_000_000
          ? { error: 'grande demais' }
          : await db.storage.from('fosco').upload(`instagram/${codigo}.jpg`, bytes, {
              contentType: 'image/jpeg',
              upsert: true,
              cacheControl: '604800',
            });
      if (error && !ja.has(codigo)) continue;
      if (!error && !ja.has(codigo)) novos++;
    } else if (!ja.has(codigo)) {
      continue; // postagem nova sem foto não entra
    }
    await db.from('fosco_instagram').upsert({
      shortcode: codigo,
      imagem: `balde:instagram/${codigo}.jpg`,
      legenda: String(p.legenda ?? '').slice(0, 400),
      video: p.tipo === 'reel' || p.video === true,
      publicado_em: p.publicado_em || null,
      ordem: i,
      atualizado_em: agora,
    });
  }

  // o que saiu das últimas postagens sai da prévia
  const manter = new Set(posts.map((p) => String(p.shortcode)));
  const velhos = (atuais ?? []).filter((a) => !manter.has(a.shortcode));
  if (velhos.length) {
    await db.storage.from('fosco').remove(velhos.map((v) => `instagram/${v.shortcode}.jpg`));
    await db.from('fosco_instagram').delete().in('shortcode', velhos.map((v) => v.shortcode));
  }

  const perfil = corpo.perfil ?? {};
  const { data: cfg } = await db.from('fosco_config').select('instagram').eq('id', 1).maybeSingle();
  await db
    .from('fosco_config')
    .update({
      instagram: {
        ...(cfg?.instagram || {}),
        atualizado_em: agora,
        seguidores: Number(perfil.seguidores) || cfg?.instagram?.seguidores || null,
        publicacoes: Number(perfil.publicacoes) || cfg?.instagram?.publicacoes || null,
      },
    })
    .eq('id', 1);

  return responder({ ok: true, posts: posts.length, novos, sairam: velhos.length }, 200, h);
});
