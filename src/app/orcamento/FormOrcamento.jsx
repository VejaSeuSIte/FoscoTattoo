'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Aviso, Campo, Fichas, encolherImagem } from '@/components/Formulario';
import { IconeFechar, IconeMais, IconeSeta } from '@/components/Icones';
import Marca from '@/components/Marca';
import { Marcado } from '@/components/Emprestimos';
import { MapaCorpo, ReguaTamanho } from './Corpo';
import { supa, erroLegivel, minhaArea } from '@/lib/supabase';
import { useVitrine } from '@/lib/vitrine';
import { BALDE_REFERENCIAS } from '@/lib/config';
import { mascaraZap, soDigitos, primeiroNome } from '@/lib/formatos';

const CORES = ['Preto e cinza', 'Colorida', 'Tanto faz'];
const MAX_FOTOS = 5;

export default function FormOrcamento() {
  const { artistas, promocoes, programa } = useVitrine();
  const [f, setF] = useState({ nome: '', whatsapp: '', email: '', artista_id: '', ideia: '', local_corpo: '', tamanho: '', estilo: '', cor: '', disponibilidade: '' });
  const [fotos, setFotos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [pronto, setPronto] = useState(null);
  const [vaga, setVaga] = useState(null);
  const [logado, setLogado] = useState(false);
  const entradaFotos = useRef(null);
  const mudar = (k) => (v) => setF((x) => ({ ...x, [k]: typeof v === 'string' ? v : v.target.value }));

  // vaga escolhida na vitrine (?vaga=id)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('vaga');
    if (!id || !promocoes?.length) return;
    const p = promocoes.find((x) => x.id === id);
    if (!p) return;
    setVaga(p);
    setF((x) => ({
      ...x,
      ideia: x.ideia || `Quero a vaga «${p.titulo}». `,
      local_corpo: x.local_corpo || (/antebra/i.test(p.titulo) ? 'Antebraço' : /panturr/i.test(p.titulo) ? 'Panturrilha' : ''),
      tamanho: x.tamanho || (/fechamento/i.test(p.titulo) ? 'Fechamento' : ''),
      artista_id: x.artista_id || p.artista_id || '',
    }));
  }, [promocoes]);

  // cliente logado já vem com nome e WhatsApp
  useEffect(() => {
    minhaArea().then((data) => {
        if (!data?.cliente) return;
        setLogado(true);
        setF((x) => ({ ...x, nome: x.nome || data.cliente.nome, whatsapp: x.whatsapp || mascaraZap(data.cliente.whatsapp), email: x.email || data.cliente.email || '' }));
      });
  }, []);

  function escolherFotos(e) {
    const novos = Array.from(e.target.files || []).filter((a) => a.type.startsWith('image/'));
    e.target.value = '';
    setFotos((atuais) =>
      [...atuais, ...novos.map((arquivo) => ({ arquivo, previa: URL.createObjectURL(arquivo) }))].slice(0, MAX_FOTOS),
    );
  }

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    if (f.nome.trim().length < 2) return setErro('Diga seu nome pra gente saber com quem fala.');
    if (soDigitos(f.whatsapp).length < 10) return setErro('Coloque seu WhatsApp com DDD.');
    if (f.ideia.trim().length < 5) return setErro('Conte um pouco da sua ideia.');
    setEnviando(true);
    try {
      const db = supa();
      const caminhos = [];
      for (const [i, foto] of fotos.entries()) {
        const arq = await encolherImagem(foto.arquivo);
        const ext = (arq.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        const caminho = `orcamentos/${crypto.randomUUID()}-${i + 1}.${ext}`;
        const { error } = await db.storage.from(BALDE_REFERENCIAS).upload(caminho, arq, { contentType: arq.type, upsert: false });
        if (!error) caminhos.push(caminho);
      }
      const { error } = await db.rpc('fosco_pedir_orcamento', { p: { ...f, referencias: caminhos } });
      if (error) throw error;
      setPronto({ nome: primeiroNome(f.nome), whatsapp: f.whatsapp, fotos: caminhos.length, pedidas: fotos.length });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setErro(erroLegivel(err));
    } finally {
      setEnviando(false);
    }
  }

  if (pronto) {
    return (
      <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
        <Marca className="mx-auto h-28 w-auto text-ambar" titulo="" />
        <h1 className="titulo mt-6 text-[clamp(48px,10vw,76px)]">Recebido, {pronto.nome}!</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-osso-2">
          A gente olha sua ideia com calma e responde no WhatsApp <b className="text-osso">{pronto.whatsapp}</b> com o valor.
          {pronto.pedidas > pronto.fotos && ' Algumas fotos não subiram; se quiser, manda elas por lá.'}
        </p>
        {!logado && (
          <div className="cartao mt-10 p-6 text-left">
            <p className="kicker">enquanto isso</p>
            <p className="mt-2 font-gotica text-[28px] font-semibold leading-tight">Ganhe desconto nessa tattoo indicando amigos.</p>
            <p className="mt-2 text-[15px] text-osso-2">Faça seu cadastro, pegue seu link e cada amigo que entrar por ele vira desconto.</p>
            <Link href="/cadastro/" className="botao mt-5">
              Quero meu link <IconeSeta width={18} height={18} />
            </Link>
          </div>
        )}
        <Link href="/" className="mt-8 inline-block text-[15px] text-osso-3 underline underline-offset-4 hover:text-osso">
          Voltar pro início
        </Link>
      </div>
    );
  }

  const comNome = artistas?.filter((a) => a.nome) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <h1 className="titulo text-[clamp(52px,10vw,92px)]">
        Conta sua <Marcado gesto="sublinhado_ondulado" cor="ambar">ideia</Marcado>
      </h1>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-osso-2">
        Quanto mais detalhe, mais certeiro o valor. A gente responde pelo WhatsApp.
      </p>
      {vaga && (
        <div className="mt-6">
          <Aviso tipo="info">
            Você está pedindo a vaga <b>«{vaga.titulo}»</b>. A gente confere se ainda tem horário e te responde.
          </Aviso>
        </div>
      )}

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_340px]">
      <form onSubmit={enviar} className="space-y-10" noValidate>
        <fieldset className="cartao space-y-6 p-5 sm:p-8">
          <legend className="sr-only">Sobre a tattoo</legend>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[13px] text-ambar">01</span>
            <h2 className="font-gotica text-[30px] font-semibold">A tattoo</h2>
          </div>
          <Campo rotulo="Qual é a ideia?" id="ideia" dica="O desenho, o significado, se já é cobertura ou continuação de outra.">
            <textarea id="ideia" className="campo min-h-[130px] resize-y" value={f.ideia} onChange={mudar('ideia')} maxLength={3000} placeholder="Ex.: uma carpa subindo o antebraço, traço fino, com umas ondas atrás." />
          </Campo>
          <Campo rotulo="Onde no corpo?">
            <MapaCorpo valor={f.local_corpo} aoMudar={mudar('local_corpo')} />
          </Campo>
          <Campo rotulo="Tamanho aproximado">
            <ReguaTamanho valor={f.tamanho} aoMudar={mudar('tamanho')} />
          </Campo>
          <div className="grid gap-6 sm:grid-cols-2">
            <Campo rotulo="Cor">
              <Fichas opcoes={CORES} valor={f.cor} aoMudar={mudar('cor')} nome="Cor" />
            </Campo>
            <Campo rotulo="Estilo (se souber)" id="estilo">
              <input id="estilo" className="campo" value={f.estilo} onChange={mudar('estilo')} maxLength={120} placeholder="fineline, oriental, old school..." />
            </Campo>
          </div>
          {comNome.length > 0 && (
            <Campo rotulo="Com quem você quer tatuar?" id="artista">
              <select id="artista" className="campo" value={f.artista_id} onChange={mudar('artista_id')}>
                <option value="">Tanto faz, me indiquem</option>
                {comNome.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </Campo>
          )}
        </fieldset>

        <fieldset className="cartao space-y-5 p-5 sm:p-8">
          <legend className="sr-only">Referências</legend>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[13px] text-ambar">02</span>
            <h2 className="font-gotica text-[30px] font-semibold">Referências</h2>
          </div>
          <p className="-mt-2 text-[14.5px] text-osso-2">Até {MAX_FOTOS} imagens: desenho que você curtiu, foto do lugar do corpo, a tattoo que vai cobrir.</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {fotos.map((foto, i) => (
              <div key={foto.previa} className="relative aspect-square overflow-hidden rounded-xl border border-osso/15">
                <img src={foto.previa} alt={`Referência ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFotos((x) => x.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 rounded-full bg-noite/85 p-1 text-osso"
                  aria-label={`Tirar a referência ${i + 1}`}
                >
                  <IconeFechar width={16} height={16} />
                </button>
              </div>
            ))}
            {fotos.length < MAX_FOTOS && (
              <button
                type="button"
                onClick={() => entradaFotos.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-osso/30 text-osso-3 transition hover:border-ambar hover:text-ambar-claro"
              >
                <IconeMais width={26} height={26} />
                <span className="text-[12px]">foto</span>
              </button>
            )}
          </div>
          <input ref={entradaFotos} type="file" accept="image/*" multiple className="hidden" onChange={escolherFotos} />
        </fieldset>

        <fieldset className="cartao space-y-6 p-5 sm:p-8">
          <legend className="sr-only">Seu contato</legend>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[13px] text-ambar">03</span>
            <h2 className="font-gotica text-[30px] font-semibold">Seu contato</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Campo rotulo="Nome" id="nome">
              <input id="nome" className="campo" value={f.nome} onChange={mudar('nome')} autoComplete="name" maxLength={120} />
            </Campo>
            <Campo rotulo="WhatsApp" id="whatsapp">
              <input
                id="whatsapp"
                className="campo"
                inputMode="tel"
                autoComplete="tel-national"
                value={f.whatsapp}
                onChange={(e) => setF((x) => ({ ...x, whatsapp: mascaraZap(e.target.value) }))}
                placeholder="(81) 99999-9999"
              />
            </Campo>
          </div>
          <Campo rotulo="E-mail (opcional)" id="email">
            <input id="email" type="email" className="campo" value={f.email} onChange={mudar('email')} autoComplete="email" maxLength={160} />
          </Campo>
          <Campo rotulo="Quando fica bom pra você?" id="disp" dica="Dias e horários que você costuma ter livre.">
            <input id="disp" className="campo" value={f.disponibilidade} onChange={mudar('disponibilidade')} maxLength={300} placeholder="Sábado de manhã, ou dia de semana depois das 17h" />
          </Campo>
        </fieldset>

        {erro && <Aviso>{erro}</Aviso>}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <button type="submit" className="botao px-8 py-4 text-[16px]" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Mandar pedido de orçamento'}
          </button>
          <span className="text-[13px] text-osso-3">Seus dados ficam só com o estúdio.</span>
        </div>
      </form>
      <Resumo f={f} fotos={fotos.length} artista={comNome.find((a) => a.id === f.artista_id)?.nome} sinal={programa?.sinal_percentual} />
      </div>
    </div>
  );
}

// o pedido se escrevendo ao lado, num papel (só no computador)
function Resumo({ f, fotos, artista, sinal }) {
  const linhas = [
    ['Onde', f.local_corpo],
    ['Tamanho', f.tamanho],
    ['Cor', f.cor],
    ['Estilo', f.estilo],
    ['Com quem', artista],
    ['Referências', fotos ? `${fotos} ${fotos === 1 ? 'foto' : 'fotos'}` : ''],
  ];
  return (
    <aside className="sticky top-24 hidden lg:block">
      <div className="papel relative rounded-[4px] px-6 pb-6 pt-8" style={{ transform: 'rotate(1.2deg)' }}>
        <span
          aria-hidden="true"
          className="absolute -top-3 left-8 h-7 w-24 -rotate-6"
          style={{ background: 'rgba(214,196,150,.75)', clipPath: 'polygon(3% 8%,0 30%,4% 52%,0 74%,3% 96%,97% 92%,100% 70%,96% 48%,100% 26%,97% 4%)' }}
        />
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6b5640]">seu pedido</p>
        <p className="mt-3 min-h-[3.2em] font-corpo text-[16px] font-semibold italic leading-snug text-[#2e221a]">
          {f.ideia ? (f.ideia.length > 110 ? f.ideia.slice(0, 107) + '...' : f.ideia) : 'A ideia aparece aqui enquanto você escreve.'}
        </p>
        <dl className="mt-4 space-y-2 border-t border-dashed border-[#7a6248]/50 pt-4 text-[14px]">
          {linhas.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-[#7a6248]">{k}</dt>
              <dd className={`text-right font-semibold ${v ? 'text-papel-tinta' : 'text-[#b3a283]'}`}>{v || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ol className="mt-8 space-y-3 px-1 text-[14.5px] leading-relaxed text-osso-2">
        <li><b className="font-gotica text-[20px] text-ambar">1</b> A gente olha sua ideia com calma.</li>
        <li><b className="font-gotica text-[20px] text-ambar">2</b> Responde no WhatsApp com o valor.</li>
        <li><b className="font-gotica text-[20px] text-ambar">3</b> Um sinal de {sinal || 30}% no Pix garante o horário.</li>
      </ol>
    </aside>
  );
}
