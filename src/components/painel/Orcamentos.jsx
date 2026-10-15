'use client';
import { useEffect, useState } from 'react';
import { Campo } from '../Formulario';
import { IconeLixo, IconeZap } from '../Icones';
import { Carregando, Chip, Vazio, useAvisar } from './ui';
import { usePainel, reaisSemSimbolo } from './contexto';
import { supa, erroLegivel } from '@/lib/supabase';
import { BALDE_REFERENCIAS } from '@/lib/config';
import { haQuanto, linkZap, mascaraZap, numero, preencher, primeiroNome } from '@/lib/formatos';

const STATUS = [
  ['novo', 'Novos'],
  ['respondido', 'Respondidos'],
  ['fechado', 'Fechados'],
  ['perdido', 'Não fecharam'],
];

function Pedido({ o, aberto, aoAbrir, aoMudar, aoApagar }) {
  const { config, modelos, artistas } = usePainel();
  const avisar = useAvisar();
  const [valor, setValor] = useState(o.valor ? String(o.valor).replace('.', ',') : '');
  const [notas, setNotas] = useState(o.notas || '');
  const [fotos, setFotos] = useState([]);

  useEffect(() => {
    if (!aberto || !o.referencias?.length) return;
    supa()
      .storage.from(BALDE_REFERENCIAS)
      .createSignedUrls(o.referencias, 3600)
      .then(({ data }) => setFotos((data || []).filter((x) => x.signedUrl).map((x) => x.signedUrl)));
  }, [aberto, o.referencias]);

  const v = Number(String(valor).replace(/\./g, '').replace(',', '.')) || 0;
  const pct = Number(config.programa.sinal_percentual) || 30;
  const modelo = modelos.find((m) => m.chave === 'orcamento_resposta');
  const ideiaCurta = o.ideia.length > 70 ? o.ideia.slice(0, 67).trim() + '...' : o.ideia;
  const texto = preencher(modelo?.texto || 'Oi, {nome}! O valor fica em R$ {valor}.', {
    nome: primeiroNome(o.nome),
    ideia: ideiaCurta,
    valor: reaisSemSimbolo(v),
    sinal_percentual: numero(pct),
    sinal: reaisSemSimbolo((v * pct) / 100),
    pix: config.estudio.chave_pix || '(chave pix)',
    estudio: config.estudio.nome_curto || 'Fosco',
  });
  const artista = artistas.find((a) => a.id === o.artista_id);

  async function salvar(campos, aviso) {
    const { error } = await supa().from('fosco_orcamentos').update({ ...campos, atualizado_em: new Date().toISOString() }).eq('id', o.id);
    if (error) return avisar(erroLegivel(error), 'erro');
    if (aviso) avisar(aviso);
    aoMudar();
  }

  return (
    <li className={`rounded-2xl border bg-carvao/70 transition ${aberto ? 'border-ambar/40' : 'border-osso/10'}`}>
      <button type="button" onClick={aoAbrir} className="w-full p-4 text-left">
        <span className="flex items-center justify-between gap-3">
          <span className="text-[16px] font-semibold text-osso">
            {o.nome}
            {o.cliente_id && <span className="ml-2 rounded-full bg-ambar/15 px-2 py-0.5 align-middle font-mono text-[10px] text-ambar-claro">cliente</span>}
          </span>
          <span className="font-mono text-[11px] text-osso-3">{haQuanto(o.criado_em)}</span>
        </span>
        <span className={`mt-1 block text-[14px] text-osso-2 ${aberto ? '' : 'line-clamp-2'}`}>{o.ideia}</span>
        <span className="mt-2 flex flex-wrap gap-1.5 text-[12px] text-osso-3">
          {[o.local_corpo, o.tamanho, o.cor, o.estilo, artista?.nome ? `com ${artista.nome}` : ''].filter(Boolean).map((t) => (
            <span key={t} className="rounded-full bg-osso/[0.07] px-2 py-0.5">
              {t}
            </span>
          ))}
          {o.referencias?.length > 0 && <span className="rounded-full bg-osso/[0.07] px-2 py-0.5">{o.referencias.length} referências</span>}
        </span>
      </button>

      {aberto && (
        <div className="space-y-4 border-t border-osso/10 p-4">
          <p className="text-[14px] text-osso-2">
            WhatsApp {mascaraZap(o.whatsapp)}
            {o.email ? ` · ${o.email}` : ''}
            {o.disponibilidade ? ` · disponível: ${o.disponibilidade}` : ''}
          </p>
          {fotos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {fotos.map((u) => (
                <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="block aspect-square overflow-hidden rounded-xl border border-osso/10">
                  <img src={u} alt="Referência" className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <Campo rotulo="Valor da tattoo (R$)" id={`v-${o.id}`} className="w-40">
              <input id={`v-${o.id}`} className="campo" inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value.replace(/[^\d.,]/g, ''))} />
            </Campo>
            {v > 0 && (
              <p className="pb-3 text-[13.5px] text-osso-3">
                sinal de {numero(pct)}% = R$ {reaisSemSimbolo((v * pct) / 100)}
              </p>
            )}
          </div>
          {v > 0 && <p className="whitespace-pre-wrap rounded-xl bg-noite/70 p-3 text-[14px] text-osso-2">{texto}</p>}
          {!config.estudio.chave_pix && v > 0 && <p className="text-[12.5px] text-ambar-claro">Coloque a chave Pix em Ajustes pra ela entrar na mensagem.</p>}
          <div className="flex flex-wrap gap-2">
            <a
              href={linkZap(o.whatsapp, v > 0 ? texto : `Oi, ${primeiroNome(o.nome)}! Aqui é do Fosco, recebemos seu pedido de orçamento.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="botao"
              onClick={() => salvar({ status: o.status === 'novo' ? 'respondido' : o.status, valor: v || null })}
            >
              <IconeZap width={18} height={18} /> {v > 0 ? 'Mandar valor no WhatsApp' : 'Responder no WhatsApp'}
            </a>
            <select className="campo w-auto py-2" value={o.status} onChange={(e) => salvar({ status: e.target.value }, 'Situação atualizada')} aria-label="Situação">
              {STATUS.map(([id, r]) => (
                <option key={id} value={id}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <Campo rotulo="Anotações" id={`n-${o.id}`}>
            <textarea id={`n-${o.id}`} className="campo min-h-[70px]" value={notas} onChange={(e) => setNotas(e.target.value)} onBlur={() => notas !== (o.notas || '') && salvar({ notas }, 'Anotação salva')} />
          </Campo>
          <button type="button" className="botao-perigo" onClick={() => aoApagar(o)}>
            <IconeLixo width={15} height={15} /> Apagar pedido
          </button>
        </div>
      )}
    </li>
  );
}

export default function Orcamentos() {
  const { foco, setFoco } = usePainel();
  const avisar = useAvisar();
  const [lista, setLista] = useState(null);
  const [status, setStatus] = useState('novo');
  const [aberto, setAberto] = useState(null);

  async function carregar() {
    const { data, error } = await supa().from('fosco_orcamentos').select('*').order('criado_em', { ascending: false }).limit(300);
    if (error) return avisar(erroLegivel(error), 'erro');
    setLista(data);
  }
  useEffect(() => {
    carregar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (foco?.orcamento) {
      setAberto(foco.orcamento);
      setFoco(null);
    }
  }, [foco, setFoco]);

  async function apagar(o) {
    if (!confirm(`Apagar o pedido de ${o.nome}?`)) return;
    if (o.referencias?.length) await supa().storage.from(BALDE_REFERENCIAS).remove(o.referencias);
    const { error } = await supa().from('fosco_orcamentos').delete().eq('id', o.id);
    if (error) return avisar(erroLegivel(error), 'erro');
    avisar('Pedido apagado');
    carregar();
  }

  if (!lista) return <Carregando />;
  const doStatus = lista.filter((o) => o.status === status);

  return (
    <div className="space-y-5">
      <div>
        <p className="kicker">pedidos que chegaram pelo site</p>
        <h1 className="titulo mt-1 text-[48px]">Orçamentos</h1>
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {STATUS.map(([id, r]) => (
          <Chip key={id} ativo={status === id} aoClicar={() => setStatus(id)} conta={lista.filter((o) => o.status === id).length}>
            {r}
          </Chip>
        ))}
      </div>
      {doStatus.length === 0 ? (
        <Vazio>Nada aqui.</Vazio>
      ) : (
        <ul className="space-y-3">
          {doStatus.map((o) => (
            <Pedido key={o.id} o={o} aberto={aberto === o.id} aoAbrir={() => setAberto(aberto === o.id ? null : o.id)} aoMudar={carregar} aoApagar={apagar} />
          ))}
        </ul>
      )}
    </div>
  );
}
