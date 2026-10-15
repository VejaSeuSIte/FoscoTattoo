'use client';
import { useEffect, useRef, useState } from 'react';
import { Campo, encolherImagem } from '../Formulario';
import { IconeLixo, IconeMais } from '../Icones';
import { Carregando, Chip, Interruptor, Vazio, useAvisar } from './ui';
import { usePainel } from './contexto';
import { supa, erroLegivel } from '@/lib/supabase';
import { BALDE_PUBLICO } from '@/lib/config';
import { limparCacheVitrine } from '@/lib/vitrine';
import { reais, urlFoto } from '@/lib/formatos';

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
  const { artistas } = usePainel();
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

// ------------------------------------------------------------------ vagas
function Vagas() {
  const { artistas } = usePainel();
  const avisar = useAvisar();
  const [lista, setLista] = useState(null);

  async function carregar() {
    const { data } = await supa().from('fosco_promocoes').select('*').order('ordem').order('criado_em', { ascending: false });
    setLista(data || []);
  }
  useEffect(() => {
    carregar();
  }, []);

  async function salvar(id, campos, aviso = 'Salvo') {
    const { error } = await supa().from('fosco_promocoes').update(campos).eq('id', id);
    if (error) return avisar(erroLegivel(error), 'erro');
    setLista((l) => l.map((p) => (p.id === id ? { ...p, ...campos } : p)));
    limparCacheVitrine();
    avisar(aviso);
  }
  async function nova() {
    const { error } = await supa().from('fosco_promocoes').insert({ titulo: 'Vaga nova', ativa: false, ordem: (lista?.length || 0) + 1 });
    if (error) return avisar(erroLegivel(error), 'erro');
    carregar();
  }
  async function apagar(p) {
    if (!confirm(`Apagar «${p.titulo}»?`)) return;
    await supa().from('fosco_promocoes').delete().eq('id', p.id);
    limparCacheVitrine();
    carregar();
  }
  const dinheiro = (v) => {
    const n = Number(String(v).replace(/\./g, '').replace(',', '.'));
    return v === '' || Number.isNaN(n) ? null : n;
  };

  if (!lista) return <Carregando />;
  return (
    <div className="space-y-4">
      <p className="text-[14px] text-osso-3">
        Aparecem em «Vagas do mês» na página inicial e na /bio. Você controla quantas vagas mostrar: mexa nos botões − e + quando alguém fechar. Depois da data, a vaga sai sozinha do site.
      </p>
      {lista.length === 0 && <Vazio>Nenhuma vaga cadastrada.</Vazio>}
      <ul className="space-y-3">
        {lista.map((p) => (
          <li key={p.id} className={`space-y-3 rounded-2xl border bg-carvao/70 p-4 ${p.ativa ? 'border-ambar/30' : 'border-osso/10 opacity-80'}`}>
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
              <Texto id={`p-t-${p.id}`} rotulo="Título" valor={p.titulo} aoSalvar={(v) => salvar(p.id, { titulo: v.trim() || 'Vaga' })} />
              <Texto id={`p-d-${p.id}`} rotulo="De (R$)" valor={p.preco_de ?? ''} aoSalvar={(v) => salvar(p.id, { preco_de: dinheiro(v) })} />
              <Texto id={`p-p-${p.id}`} rotulo="Por (R$)" valor={p.preco_por ?? ''} aoSalvar={(v) => salvar(p.id, { preco_por: dinheiro(v) })} />
            </div>
            <Texto id={`p-x-${p.id}`} rotulo="Descrição" valor={p.descricao} aoSalvar={(v) => salvar(p.id, { descricao: v })} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Campo rotulo="Vagas à mostra" id={`p-v-${p.id}`}>
                <div className="flex items-center gap-2">
                  <button type="button" className="botao-mini h-10 w-10" onClick={() => salvar(p.id, { vagas: Math.max(0, (p.vagas ?? 1) - 1) }, 'Vagas atualizadas')}>
                    −
                  </button>
                  <span className="w-12 text-center font-gotica text-[30px] font-bold">{p.vagas ?? '—'}</span>
                  <button type="button" className="botao-mini h-10 w-10" onClick={() => salvar(p.id, { vagas: (p.vagas ?? 0) + 1 }, 'Vagas atualizadas')}>
                    +
                  </button>
                  {p.vagas !== null && (
                    <button type="button" className="text-[12px] text-osso-3 underline" onClick={() => salvar(p.id, { vagas: null }, 'Sem contagem')}>
                      não mostrar número
                    </button>
                  )}
                </div>
              </Campo>
              <Campo rotulo="Vale até" id={`p-a-${p.id}`}>
                <input id={`p-a-${p.id}`} type="date" className="campo py-2" value={p.valida_ate || ''} onChange={(e) => salvar(p.id, { valida_ate: e.target.value || null })} />
              </Campo>
              <Campo rotulo="Com quem" id={`p-r-${p.id}`}>
                <select id={`p-r-${p.id}`} className="campo py-2" value={p.artista_id || ''} onChange={(e) => salvar(p.id, { artista_id: e.target.value || null })}>
                  <option value="">Qualquer artista</option>
                  {artistas
                    .filter((a) => a.nome)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome}
                      </option>
                    ))}
                </select>
              </Campo>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Interruptor ligado={p.ativa} aoMudar={(v) => salvar(p.id, { ativa: v })} rotulo={p.ativa ? 'No site' : 'Fora do site'} />
              {p.preco_de && p.preco_por && <span className="text-[13px] text-osso-3">{Math.round((1 - p.preco_por / p.preco_de) * 100)}% off · {reais(p.preco_por)}</span>}
              <button type="button" className="botao-perigo" onClick={() => apagar(p)}>
                <IconeLixo width={15} height={15} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="botao" onClick={nova}>
        <IconeMais width={18} height={18} /> Nova vaga
      </button>
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
        <Chip ativo={aba === 'vagas'} aoClicar={() => setAba('vagas')}>
          Vagas do mês
        </Chip>
        <Chip ativo={aba === 'trabalhos'} aoClicar={() => setAba('trabalhos')}>
          Trabalhos
        </Chip>
      </div>
      {aba === 'equipe' && <Equipe />}
      {aba === 'vagas' && <Vagas />}
      {aba === 'trabalhos' && <Trabalhos />}
    </div>
  );
}
