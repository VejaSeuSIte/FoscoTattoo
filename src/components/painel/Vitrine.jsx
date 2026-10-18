'use client';
import { useEffect, useRef, useState } from 'react';
import { Campo, encolherImagem } from '../Formulario';
import { IconeExterno, IconeGota, IconeInsta, IconeLixo, IconeMais, IconePessoas, IconePino, IconePresente, IconeSeta, IconeZap } from '../Icones';
import { Carregando, Chip, Interruptor, Vazio, useAvisar } from './ui';
import { usePainel } from './contexto';
import { supa, erroLegivel } from '@/lib/supabase';
import { BALDE_PUBLICO } from '@/lib/config';
import { limparCacheVitrine } from '@/lib/vitrine';
import { haQuanto, urlFoto, urlSite } from '@/lib/formatos';

async function subirFoto(arquivo, pasta) {
  const arq = await encolherImagem(arquivo, 1600, 0.86);
  const ext = arq.type === 'image/webp' ? 'webp' : arq.type === 'image/png' ? 'png' : 'jpg';
  const caminho = `${pasta}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supa().storage.from(BALDE_PUBLICO).upload(caminho, arq, { contentType: arq.type, cacheControl: '31536000' });
  if (error) throw error;
  return `balde:${caminho}`;
}

// salva um campo quando a pessoa sai dele
function Texto({ valor, aoSalvar, rotulo, id, multi = false, placeholder }) {
  const [v, setV] = useState(valor ?? '');
  useEffect(() => setV(valor ?? ''), [valor]);
  const props = {
    id,
    className: `campo py-2 ${multi ? 'min-h-[70px]' : ''}`,
    value: v,
    placeholder,
    onChange: (e) => setV(e.target.value),
    onBlur: () => v !== (valor ?? '') && aoSalvar(v),
  };
  return <Campo rotulo={rotulo} id={id}>{multi ? <textarea {...props} /> : <input {...props} />}</Campo>;
}

// as 4 artes que aparecem no verso do cartão do artista
function ArtesDoVerso({ artista, aoSalvar }) {
  const avisar = useAvisar();
  const entrada = useRef(null);
  const [vaga, setVaga] = useState(null);
  const [subindo, setSubindo] = useState(false);
  const lista = [0, 1, 2, 3].map((i) => (artista.trabalhos || [])[i] || '');

  async function trocar(e) {
    const arq = e.target.files?.[0];
    e.target.value = '';
    if (!arq || vaga === null) return;
    setSubindo(true);
    try {
      const nova = [...lista];
      nova[vaga] = await subirFoto(arq, 'equipe/artes');
      await aoSalvar(nova.filter(Boolean));
    } catch (err) {
      avisar(erroLegivel(err), 'erro');
    }
    setSubindo(false);
    setVaga(null);
  }

  return (
    <div>
      <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-latao">Artes do verso do cartão</p>
      <div className="grid max-w-[340px] grid-cols-4 gap-2">
        {lista.map((t, i) => (
          <div key={i} className="relative">
            <button
              type="button"
              className="block aspect-square w-full overflow-hidden rounded-lg border border-dashed border-osso/25 bg-noite text-[12px] text-osso-3 hover:border-ambar"
              onClick={() => {
                setVaga(t ? i : lista.filter(Boolean).length);
                entrada.current?.click();
              }}
              disabled={subindo}
              aria-label={t ? `Trocar a arte ${i + 1}` : 'Adicionar arte'}
            >
              {t ? <img src={urlFoto(t)} alt="" className="h-full w-full object-cover" /> : '+'}
            </button>
            {t && (
              <button
                type="button"
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-carvao text-[13px] text-osso ring-1 ring-osso/30 hover:text-[#f0a596]"
                onClick={() => aoSalvar(lista.filter((x, j) => x && j !== i))}
                aria-label={`Tirar a arte ${i + 1}`}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[12.5px] text-osso-3">{subindo ? 'Subindo a foto...' : 'Toque num quadrado para trocar. Sem artes, o cartão não vira.'}</p>
      <input ref={entrada} type="file" accept="image/*" className="hidden" onChange={trocar} />
    </div>
  );
}

// ------------------------------------------------------------------ equipe
function Equipe() {
  const { artistas, setArtistas, recarregarBase } = usePainel();
  const avisar = useAvisar();
  const entrada = useRef(null);
  const [trocando, setTrocando] = useState(null);

  async function salvar(id, campos) {
    const { error } = await supa().from('fosco_artistas').update(campos).eq('id', id);
    if (error) return avisar(erroLegivel(error), 'erro');
    setArtistas((l) => l.map((a) => (a.id === id ? { ...a, ...campos } : a)));
    limparCacheVitrine();
    avisar('Salvo');
  }
  async function trocarFoto(e) {
    const arq = e.target.files?.[0];
    e.target.value = '';
    if (!arq || !trocando) return;
    try {
      const foto = await subirFoto(arq, 'equipe');
      if (trocando === 'novo') {
        const { error } = await supa().from('fosco_artistas').insert({ foto, ordem: artistas.length + 1 });
        if (error) throw error;
        await recarregarBase();
        avisar('Artista adicionado: agora coloque o nome');
      } else await salvar(trocando, { foto });
    } catch (err) {
      avisar(erroLegivel(err), 'erro');
    }
    setTrocando(null);
  }
  async function mover(i, d) {
    const j = i + d;
    if (j < 0 || j >= artistas.length) return;
    const a = artistas[i];
    const b = artistas[j];
    await supa().from('fosco_artistas').update({ ordem: j + 1 }).eq('id', a.id);
    await supa().from('fosco_artistas').update({ ordem: i + 1 }).eq('id', b.id);
    limparCacheVitrine();
    recarregarBase();
  }
  async function apagar(a) {
    if (!confirm(`Tirar ${a.nome || 'esse retrato'} do site de vez? (Pra esconder só por um tempo, use o liga/desliga.)`)) return;
    const { error } = await supa().from('fosco_artistas').delete().eq('id', a.id);
    if (error) return avisar(erroLegivel(error), 'erro');
    limparCacheVitrine();
    recarregarBase();
  }

  return (
    <div className="space-y-4">
      <p className="text-[14px] text-osso-3">Os retratos aparecem na parede da página inicial, na ordem daqui. Falta dar nome a quem está sem.</p>
      <ul className="space-y-3">
        {artistas.map((a, i) => (
          <li key={a.id} className={`grid gap-4 rounded-2xl border bg-carvao/70 p-4 sm:grid-cols-[110px_1fr] ${a.nome ? 'border-osso/10' : 'border-ambar/50'}`}>
            <div>
              <img src={urlFoto(a.foto)} alt="" className={`aspect-[3/4] w-full rounded-lg object-cover object-[50%_15%] ${a.ativo ? '' : 'opacity-40 grayscale'}`} />
              <button
                type="button"
                className="botao-mini mt-2 w-full"
                onClick={() => {
                  setTrocando(a.id);
                  entrada.current?.click();
                }}
              >
                Trocar foto
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Texto id={`a-n-${a.id}`} rotulo="Nome" valor={a.nome} placeholder="falta o nome" aoSalvar={(v) => salvar(a.id, { nome: v.trim() })} />
                <Texto id={`a-f-${a.id}`} rotulo="Faz" valor={a.funcao} aoSalvar={(v) => salvar(a.id, { funcao: v.trim() })} />
                <Texto id={`a-i-${a.id}`} rotulo="Instagram" valor={a.instagram} placeholder="@usuario" aoSalvar={(v) => salvar(a.id, { instagram: v.trim().replace(/^@/, '') })} />
              </div>
              <Texto id={`a-e-${a.id}`} rotulo="Estilos" valor={a.estilos} placeholder="fineline, blackwork..." aoSalvar={(v) => salvar(a.id, { estilos: v })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Texto id={`a-c-${a.id}`} rotulo="Nome completo (verso do cartão)" valor={a.nome_completo} aoSalvar={(v) => salvar(a.id, { nome_completo: v.trim() })} />
                <Texto id={`a-s-${a.id}`} rotulo="Site ou portfólio (opcional)" valor={a.site} placeholder="https://..." aoSalvar={(v) => salvar(a.id, { site: v.trim() })} />
              </div>
              <Texto id={`a-b-${a.id}`} rotulo="Sobre (duas linhas no verso)" valor={a.bio} multi aoSalvar={(v) => salvar(a.id, { bio: v.trim() })} />
              <ArtesDoVerso artista={a} aoSalvar={(trabalhos) => salvar(a.id, { trabalhos })} />
              <div className="flex flex-wrap items-center gap-3">
                <Interruptor ligado={a.ativo} aoMudar={(v) => salvar(a.id, { ativo: v })} rotulo={a.ativo ? 'Aparece no site' : 'Escondido'} />
                <span className="flex-1" />
                <button type="button" className="botao-mini" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir">
                  ↑
                </button>
                <button type="button" className="botao-mini" onClick={() => mover(i, 1)} disabled={i === artistas.length - 1} aria-label="Descer">
                  ↓
                </button>
                <button type="button" className="botao-perigo" onClick={() => apagar(a)} aria-label="Apagar">
                  <IconeLixo width={15} height={15} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="botao"
        onClick={() => {
          setTrocando('novo');
          entrada.current?.click();
        }}
      >
        <IconeMais width={18} height={18} /> Adicionar artista (começa pela foto)
      </button>
      <input ref={entrada} type="file" accept="image/*" className="hidden" onChange={trocarFoto} />
    </div>
  );
}

// ------------------------------------------------------------------ trabalhos
function Trabalhos() {
  const { artistas, config } = usePainel();
  const ig = config.instagram || {};
  const avisar = useAvisar();
  const [lista, setLista] = useState(null);
  const [subindo, setSubindo] = useState(0);
  const entrada = useRef(null);

  async function carregar() {
    const { data } = await supa().from('fosco_trabalhos').select('*').order('ordem').order('criado_em', { ascending: false });
    setLista(data || []);
  }
  useEffect(() => {
    carregar();
  }, []);

  async function subir(e) {
    const arqs = Array.from(e.target.files || []);
    e.target.value = '';
    setSubindo(arqs.length);
    for (const arq of arqs) {
      try {
        const imagem = await subirFoto(arq, 'trabalhos');
        await supa().from('fosco_trabalhos').insert({ imagem });
      } catch (err) {
        avisar(erroLegivel(err), 'erro');
      }
      setSubindo((n) => n - 1);
    }
    limparCacheVitrine();
    carregar();
  }
  async function salvar(id, campos) {
    const { error } = await supa().from('fosco_trabalhos').update(campos).eq('id', id);
    if (error) return avisar(erroLegivel(error), 'erro');
    setLista((l) => l.map((t) => (t.id === id ? { ...t, ...campos } : t)));
    limparCacheVitrine();
  }
  async function apagar(t) {
    if (!confirm('Apagar essa foto?')) return;
    if (t.imagem.startsWith('balde:')) await supa().storage.from(BALDE_PUBLICO).remove([t.imagem.slice(6)]);
    await supa().from('fosco_trabalhos').delete().eq('id', t.id);
    limparCacheVitrine();
    carregar();
  }

  if (!lista) return <Carregando />;
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-ambar/30 bg-ambar/[0.07] p-4 text-[14px] leading-relaxed text-osso-2">
        <b className="text-osso">Prévia do Instagram:</b> a seção «Tinta na pele» mostra as 12 últimas postagens do @{String(config.estudio.instagram || 'foscotattoo').replace(/^@/, '')}.
        Um robô atualiza todo dia sozinho{ig.atualizado_em ? ` (última vez ${haQuanto(ig.atualizado_em)})` : ''}. As fotos que você subir aqui só aparecem se a prévia estiver vazia.
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="botao" onClick={() => entrada.current?.click()} disabled={subindo > 0}>
          <IconeMais width={18} height={18} /> {subindo > 0 ? `Subindo ${subindo}...` : 'Subir fotos de trabalhos'}
        </button>
        <span className="text-[13.5px] text-osso-3">Pode escolher várias de uma vez. Enquanto não tiver nenhuma, o site manda pro Instagram.</span>
      </div>
      <input ref={entrada} type="file" accept="image/*" multiple className="hidden" onChange={subir} />
      {lista.length === 0 ? (
        <Vazio>Nenhuma foto ainda.</Vazio>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {lista.map((t) => (
            <li key={t.id} className="overflow-hidden rounded-2xl border border-osso/10 bg-carvao/70">
              <img src={urlFoto(t.imagem)} alt="" className={`aspect-square w-full object-cover ${t.publicado ? '' : 'opacity-40'}`} />
              <div className="space-y-2 p-3">
                <select className="campo py-1.5 text-[13.5px]" value={t.artista_id || ''} onChange={(e) => salvar(t.id, { artista_id: e.target.value || null })} aria-label="Artista">
                  <option value="">Artista?</option>
                  {artistas.map((a, i) => (
                    <option key={a.id} value={a.id}>
                      {a.nome || `Retrato ${i + 1}`}
                    </option>
                  ))}
                </select>
                <Texto id={`t-l-${t.id}`} valor={t.legenda} placeholder="legenda" aoSalvar={(v) => salvar(t.id, { legenda: v })} />
                <div className="flex items-center justify-between">
                  <Interruptor ligado={t.publicado} aoMudar={(v) => salvar(t.id, { publicado: v })} rotulo="" />
                  <button type="button" className="rounded-full p-1.5 text-osso-3 hover:text-[#f0a596]" onClick={() => apagar(t)} aria-label="Apagar foto">
                    <IconeLixo width={16} height={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


// ------------------------------------------------------------------ bio
export const ICONES_BIO = { presente: IconePresente, zap: IconeZap, gota: IconeGota, pessoas: IconePessoas, pino: IconePino, insta: IconeInsta, seta: IconeSeta, externo: IconeExterno };
const ATALHOS = [
  ['@indique', 'Indique e ganhe (cadastro)'],
  ['@orcamento', 'Orçamento no WhatsApp'],
  ['@whatsapp', 'WhatsApp do estúdio'],
  ['@instagram', 'Instagram do estúdio'],
  ['@mapa', 'Como chegar (Google Maps)'],
];

function BioLinks() {
  const { config, setConfig } = usePainel();
  const avisar = useAvisar();
  const [links, setLinks] = useState(null);

  async function carregar() {
    const { data, error } = await supa().from('fosco_bio_links').select('*').order('ordem').order('criado_em');
    if (error) return avisar(erroLegivel(error), 'erro');
    setLinks(data);
  }
  useEffect(() => {
    carregar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function salvar(id, campos) {
    const { error } = await supa().from('fosco_bio_links').update(campos).eq('id', id);
    if (error) return avisar(erroLegivel(error), 'erro');
    setLinks((l) => l.map((x) => (x.id === id ? { ...x, ...campos } : x)));
    limparCacheVitrine();
    avisar('Salvo');
  }
  async function novo() {
    const { error } = await supa().from('fosco_bio_links').insert({ titulo: 'Link novo', link: 'https://', icone: 'externo', ordem: (links?.length || 0) + 1 });
    if (error) return avisar(erroLegivel(error), 'erro');
    limparCacheVitrine();
    carregar();
  }
  async function mover(i, d) {
    const j = i + d;
    if (j < 0 || j >= links.length) return;
    await supa().from('fosco_bio_links').update({ ordem: j + 1 }).eq('id', links[i].id);
    await supa().from('fosco_bio_links').update({ ordem: i + 1 }).eq('id', links[j].id);
    limparCacheVitrine();
    carregar();
  }
  async function apagar(x) {
    if (!confirm(`Tirar «${x.titulo}» da bio de vez? (Pra esconder só por um tempo, use o liga/desliga.)`)) return;
    const { error } = await supa().from('fosco_bio_links').delete().eq('id', x.id);
    if (error) return avisar(erroLegivel(error), 'erro');
    limparCacheVitrine();
    carregar();
  }
  async function mostrarBloco(chave, v) {
    const estudio = { ...config.estudio, [chave]: v };
    const { error } = await supa().from('fosco_config').update({ estudio, atualizado_em: new Date().toISOString() }).eq('id', 1);
    if (error) return avisar(erroLegivel(error), 'erro');
    setConfig({ ...config, estudio });
    limparCacheVitrine();
    avisar('Salvo');
  }

  if (!links) return <Carregando />;
  return (
    <div className="space-y-4">
      <p className="text-[14px] text-osso-3">
        Os botões da página{' '}
        <a href={urlSite('/bio/')} target="_blank" rel="noopener noreferrer" className="text-ambar-claro underline underline-offset-4">
          /bio
        </a>
        , na ordem daqui. No link, use um endereço (https://..., /cuidados/) ou um atalho. Nos textos, {'{max}'} e {'{primeira}'} viram os números da indicação.
      </p>
      <ul className="space-y-3">
        {links.map((x, i) => {
          const Icone = ICONES_BIO[x.icone] || IconeSeta;
          return (
            <li key={x.id} className={`space-y-3 rounded-2xl border bg-carvao/70 p-4 ${x.destaque ? 'border-ambar/60' : 'border-osso/10'} ${x.ativo ? '' : 'opacity-60'}`}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Texto id={`b-t-${x.id}`} rotulo="Título" valor={x.titulo} aoSalvar={(v) => salvar(x.id, { titulo: v.trim() })} />
                <Texto id={`b-s-${x.id}`} rotulo="Linha de baixo (opcional)" valor={x.sub} aoSalvar={(v) => salvar(x.id, { sub: v.trim() })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Texto id={`b-l-${x.id}`} rotulo="Link" valor={x.link} placeholder="https://... ou @orcamento" aoSalvar={(v) => salvar(x.id, { link: v.trim() })} />
                <Campo rotulo="Atalho" id={`b-a-${x.id}`}>
                  <select id={`b-a-${x.id}`} className="campo py-2" value="" onChange={(e) => e.target.value && salvar(x.id, { link: e.target.value })}>
                    <option value="">escolher...</option>
                    {ATALHOS.map(([v, r]) => (
                      <option key={v} value={v}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Campo>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(ICONES_BIO).map(([k, I]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => salvar(x.id, { icone: k })}
                    aria-label={`Ícone ${k}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border ${x.icone === k ? 'border-ambar bg-ambar/15 text-ambar-claro' : 'border-osso/15 text-osso-3 hover:text-osso'}`}
                  >
                    <I width={17} height={17} />
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Interruptor ligado={x.ativo} aoMudar={(v) => salvar(x.id, { ativo: v })} rotulo={x.ativo ? 'Aparece' : 'Escondido'} />
                <Interruptor ligado={x.destaque} aoMudar={(v) => salvar(x.id, { destaque: v })} rotulo="Destaque âmbar" />
                <span className="flex-1" />
                <Icone width={18} height={18} className="text-osso-3" />
                <button type="button" className="botao-mini" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir">
                  ↑
                </button>
                <button type="button" className="botao-mini" onClick={() => mover(i, 1)} disabled={i === links.length - 1} aria-label="Descer">
                  ↓
                </button>
                <button type="button" className="botao-perigo" onClick={() => apagar(x)} aria-label="Apagar">
                  <IconeLixo width={15} height={15} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <button type="button" className="botao" onClick={novo}>
        <IconeMais width={18} height={18} /> Adicionar botão
      </button>
      <div className="space-y-3 border-t border-osso/10 pt-4">
        <p className="kicker">blocos de baixo</p>
        <Interruptor ligado={config.estudio.bio_equipe !== false} aoMudar={(v) => mostrarBloco('bio_equipe', v)} rotulo="Mostrar «Nossa equipe»" />
        <Interruptor ligado={config.estudio.bio_trabalhos !== false} aoMudar={(v) => mostrarBloco('bio_trabalhos', v)} rotulo="Mostrar «Trabalhos recentes»" />
      </div>
    </div>
  );
}

export default function Vitrine() {
  const [aba, setAba] = useState('equipe');
  return (
    <div className="space-y-5">
      <div>
        <p className="kicker">o que aparece no site</p>
        <h1 className="titulo mt-1 text-[48px]">Vitrine</h1>
      </div>
      <div className="flex gap-2">
        <Chip ativo={aba === 'equipe'} aoClicar={() => setAba('equipe')}>
          Equipe
        </Chip>
        <Chip ativo={aba === 'trabalhos'} aoClicar={() => setAba('trabalhos')}>
          Trabalhos
        </Chip>
        <Chip ativo={aba === 'bio'} aoClicar={() => setAba('bio')}>
          Bio
        </Chip>
      </div>
      {aba === 'equipe' && <Equipe />}
      {aba === 'trabalhos' && <Trabalhos />}
      {aba === 'bio' && <BioLinks />}
    </div>
  );
}
