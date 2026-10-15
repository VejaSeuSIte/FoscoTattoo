'use client';
import { useEffect, useMemo, useState } from 'react';
import { Campo } from '../Formulario';
import { IconeCheck, IconeCopiar, IconeEmail, IconeLixo, IconeMais, IconeZap } from '../Icones';
import { Carregando, Chip, Secao, Vazio, useAvisar } from './ui';
import { usePainel, variaveis } from './contexto';
import { supa, erroLegivel } from '@/lib/supabase';
import { haQuanto, linkZap, mascaraZap, preencher } from '@/lib/formatos';
import { filtrar } from './Clientes';

const SEGMENTOS = [
  ['aniver_hoje', 'Aniversário hoje', 'aniversario'],
  ['aniver_semana', 'Aniversário nos próximos 7 dias', 'aniversario'],
  ['aniver_mes', 'Aniversário no mês', 'aniversario'],
  ['com_desconto', 'Têm desconto pra usar', 'desconto_parado'],
  ['quase', 'Falta 1 ou 2 sessões pro prêmio', 'fidelidade_quase'],
  ['nunca_tatuou', 'Cadastraram e nunca tatuaram', 'primeira_tattoo'],
  ['sumidos', 'Sumidos há 6+ meses', 'saudade'],
  ['novos', 'Cadastrados nos últimos 30 dias', 'promocao'],
  ['todos', 'Todo mundo', 'promocao'],
];

const VARIAVEIS = ['{nome}', '{desconto}', '{pontos}', '{link}', '{faltam}', '{premio}', '{site}'];

function proximos(c, dias) {
  if (!c.nascimento) return false;
  const [, m, d] = c.nascimento.split('-').map(Number);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  for (let i = 0; i < dias; i++) {
    const x = new Date(hoje.getTime() + i * 86400000);
    if (x.getMonth() + 1 === m && x.getDate() === d) return true;
  }
  return false;
}

function segmentar(lista, seg, programa) {
  if (seg === 'aniver_hoje') return lista.filter((c) => proximos(c, 1));
  if (seg === 'aniver_semana') return lista.filter((c) => proximos(c, 7));
  if (seg === 'quase') {
    const n = Math.max(1, Number(programa.fidelidade_sessoes) || 6);
    return lista.filter((c) => c.sessoes_fidelidade > 0 && n - (c.sessoes_fidelidade % n) <= 2 && c.sessoes_fidelidade % n !== 0);
  }
  return filtrar(lista, seg, programa);
}

function Modelos() {
  const { modelos, setModelos } = usePainel();
  const avisar = useAvisar();
  const [rascunhos, setRascunhos] = useState({});

  async function salvar(m) {
    const texto = rascunhos[m.id]?.texto ?? m.texto;
    const nome = rascunhos[m.id]?.nome ?? m.nome;
    const { error } = await supa().from('fosco_modelos').update({ texto, nome }).eq('id', m.id);
    if (error) return avisar(erroLegivel(error), 'erro');
    setModelos((l) => l.map((x) => (x.id === m.id ? { ...x, texto, nome } : x)));
    setRascunhos((r) => ({ ...r, [m.id]: undefined }));
    avisar('Modelo salvo');
  }
  async function criar() {
    const { data, error } = await supa().from('fosco_modelos').insert({ nome: 'Modelo novo', texto: 'Oi, {nome}! ', tipo: 'campanha', ordem: 15 }).select().single();
    if (error) return avisar(erroLegivel(error), 'erro');
    setModelos((l) => [...l, data]);
  }
  async function apagar(m) {
    if (!confirm(`Apagar o modelo «${m.nome}»?`)) return;
    const { error } = await supa().from('fosco_modelos').delete().eq('id', m.id);
    if (error) return avisar(erroLegivel(error), 'erro');
    setModelos((l) => l.filter((x) => x.id !== m.id));
  }

  return (
    <Secao
      titulo="Modelos de mensagem"
      acao={
        <button type="button" className="botao-mini" onClick={criar}>
          <IconeMais width={15} height={15} /> Novo modelo
        </button>
      }
    >
      <p className="mb-3 text-[13.5px] text-osso-3">
        Palavras entre chaves viram os dados de cada pessoa: {VARIAVEIS.join(' ')}. Os modelos «Acesso», «Senha nova» e «Resposta de orçamento» são usados pelo painel nas horas certas.
      </p>
      <div className="grid gap-3 lg:grid-cols-2">
        {modelos.map((m) => {
          const r = rascunhos[m.id];
          const mudou = r && (r.texto !== undefined || r.nome !== undefined);
          return (
            <div key={m.id} className="rounded-2xl border border-osso/10 bg-carvao/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <input
                  className="w-full bg-transparent font-semibold text-osso outline-none"
                  value={r?.nome ?? m.nome}
                  onChange={(e) => setRascunhos((x) => ({ ...x, [m.id]: { ...x[m.id], nome: e.target.value } }))}
                  aria-label="Nome do modelo"
                />
                {m.tipo === 'campanha' && (
                  <button type="button" onClick={() => apagar(m)} className="rounded-full p-1.5 text-osso-3 hover:text-[#f0a596]" aria-label="Apagar modelo">
                    <IconeLixo width={16} height={16} />
                  </button>
                )}
              </div>
              <textarea
                className="campo mt-2 min-h-[110px] text-[14.5px]"
                value={r?.texto ?? m.texto}
                onChange={(e) => setRascunhos((x) => ({ ...x, [m.id]: { ...x[m.id], texto: e.target.value } }))}
                aria-label={`Texto do modelo ${m.nome}`}
              />
              {mudou && (
                <button type="button" className="botao-mini mt-2" onClick={() => salvar(m)}>
                  Salvar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Secao>
  );
}

export default function Mensagens() {
  const { clientes, config, modelos, foco, setFoco, recarregarClientes } = usePainel();
  const avisar = useAvisar();
  const [seg, setSeg] = useState('aniver_mes');
  const [modeloId, setModeloId] = useState('');
  const [texto, setTexto] = useState('');
  const [enviados, setEnviados] = useState({});
  const [assunto, setAssunto] = useState('Novidade do Fosco');

  useEffect(() => {
    if (foco?.segmento) {
      setSeg(foco.segmento);
      setFoco(null);
    }
  }, [foco, setFoco]);

  // ao trocar o público, sugere o modelo que combina
  useEffect(() => {
    const chave = SEGMENTOS.find((s) => s[0] === seg)?.[2];
    const m = modelos.find((x) => x.chave === chave) || modelos.find((x) => x.tipo === 'campanha');
    if (m) {
      setModeloId(m.id);
      setTexto(m.texto);
    }
  }, [seg, modelos]);

  const todos = useMemo(() => segmentar(clientes || [], seg, config.programa), [clientes, seg, config.programa]);
  if (!clientes) return <Carregando />;
  const pessoas = todos.filter((c) => c.aceita_promocoes);
  const deFora = todos.length - pessoas.length;
  const comEmail = pessoas.filter((c) => c.email);
  const modelo = modelos.find((m) => m.id === modeloId);
  const semana = Date.now() - 7 * 86400000;

  async function registrar(c) {
    setEnviados((e) => ({ ...e, [c.id]: true }));
    await supa().from('fosco_envios').insert({ cliente_id: c.id, canal: 'whatsapp', modelo: modelo?.chave || modelo?.nome || '' });
  }

  async function copiarEmails() {
    try {
      await navigator.clipboard.writeText(comEmail.map((c) => c.email).join(', '));
      avisar(`${comEmail.length} e-mails copiados`);
    } catch {
      avisar('Não deu pra copiar', 'erro');
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="kicker">sem robô, sem risco de bloquear o número</p>
        <h1 className="titulo mt-1 text-[48px]">Mensagens</h1>
        <p className="mt-2 max-w-2xl text-[15px] text-osso-2">
          Escolha o público e o modelo. Cada pessoa ganha um botão que abre o WhatsApp com a mensagem já escrita pra ela: é só tocar em enviar e passar pra próxima.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <Campo rotulo="Público" id="m-seg">
            <select id="m-seg" className="campo" value={seg} onChange={(e) => setSeg(e.target.value)}>
              {SEGMENTOS.map(([id, r]) => (
                <option key={id} value={id}>
                  {r} ({segmentar(clientes, id, config.programa).filter((c) => c.aceita_promocoes).length})
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Modelo" id="m-mod">
            <select
              id="m-mod"
              className="campo"
              value={modeloId}
              onChange={(e) => {
                setModeloId(e.target.value);
                setTexto(modelos.find((m) => m.id === e.target.value)?.texto || '');
              }}
            >
              {modelos
                .filter((m) => m.tipo === 'campanha')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
            </select>
          </Campo>
          <Campo rotulo="Mensagem (pode mexer só pra essa leva)" id="m-txt">
            <textarea id="m-txt" className="campo min-h-[140px] text-[14.5px]" value={texto} onChange={(e) => setTexto(e.target.value)} />
          </Campo>
          {deFora > 0 && (
            <p className="text-[13px] text-osso-3">
              {deFora} {deFora === 1 ? 'pessoa ficou' : 'pessoas ficaram'} de fora porque não marcou que aceita receber mensagens.
            </p>
          )}
          {comEmail.length > 0 && (
            <div className="rounded-2xl border border-osso/10 bg-carvao/70 p-4">
              <p className="flex items-center gap-2 text-[14px] text-osso">
                <IconeEmail width={18} height={18} /> {comEmail.length} desse público têm e-mail
              </p>
              <Campo rotulo="Assunto" id="m-ass" className="mt-3">
                <input id="m-ass" className="campo py-2" value={assunto} onChange={(e) => setAssunto(e.target.value)} />
              </Campo>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="botao-mini" onClick={copiarEmails}>
                  <IconeCopiar width={15} height={15} /> Copiar e-mails
                </button>
                <a
                  className="botao-mini"
                  href={`mailto:?bcc=${encodeURIComponent(comEmail.map((c) => c.email).join(','))}&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(preencher(texto, { ...variaveis({}, config.estudio, config.programa), nome: 'pessoal' }))}`}
                >
                  <IconeEmail width={15} height={15} /> Abrir no e-mail (cópia oculta)
                </a>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-gotica text-[24px] font-semibold">
              {pessoas.length} {pessoas.length === 1 ? 'pessoa' : 'pessoas'}
            </h3>
            <span className="font-mono text-[12px] text-osso-3">{Object.keys(enviados).length} enviadas agora</span>
          </div>
          {pessoas.length === 0 ? (
            <Vazio>Ninguém nesse público agora.</Vazio>
          ) : (
            <ul className="max-h-[70svh] space-y-2 overflow-y-auto pr-1">
              {pessoas.map((c) => {
                const msg = preencher(texto, variaveis(c, config.estudio, config.programa));
                const foi = enviados[c.id];
                const recente = c.ultimo_envio && new Date(c.ultimo_envio).getTime() > semana;
                return (
                  <li key={c.id} className={`rounded-2xl border p-3 ${foi ? 'border-[#5f8a4c]/40 bg-[#5f8a4c]/10' : 'border-osso/10 bg-carvao/70'}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] text-osso">{c.nome}</span>
                        <span className="font-mono text-[11.5px] text-osso-3">
                          {mascaraZap(c.whatsapp)}
                          {recente && !foi ? ` · recebeu mensagem ${haQuanto(c.ultimo_envio)}` : ''}
                        </span>
                      </span>
                      <a href={linkZap(c.whatsapp, msg)} target="_blank" rel="noopener noreferrer" onClick={() => registrar(c)} className={foi ? 'botao-mini shrink-0' : 'botao shrink-0 px-4 py-2 text-[13.5px]'}>
                        {foi ? <IconeCheck width={15} height={15} /> : <IconeZap width={16} height={16} />}
                        {foi ? 'Enviada' : 'Abrir'}
                      </a>
                    </div>
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[12px] text-osso-3">ver mensagem</summary>
                      <p className="mt-1 whitespace-pre-wrap text-[13.5px] text-osso-2">{msg}</p>
                    </details>
                  </li>
                );
              })}
            </ul>
          )}
          {Object.keys(enviados).length > 0 && (
            <button type="button" className="botao-mini mt-3" onClick={recarregarClientes}>
              Atualizar lista
            </button>
          )}
        </div>
      </div>

      <Modelos />
    </div>
  );
}
