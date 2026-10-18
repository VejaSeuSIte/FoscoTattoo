'use client';
import { useEffect, useState } from 'react';
import { IconeBolo, IconeMais, IconeZap, IconeAgulha } from '../Icones';
import { Numero, Secao, Vazio } from './ui';
import { usePainel, variaveis } from './contexto';
import { supa } from '@/lib/supabase';
import { diaMes, haQuanto, linkZap, mascaraZap, preencher, primeiroNome } from '@/lib/formatos';

const hojeMD = () => {
  const d = new Date();
  return [d.getMonth() + 1, d.getDate()];
};

export default function Inicio() {
  const { usuario, clientes, config, modelos, irPara, recarregarClientes } = usePainel();
  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    const db = supa();
    db.rpc('fosco_admin_resumo').then(({ data }) => setResumo(data));
  }, []);

  const [mes, dia] = hojeMD();
  const lista = clientes || [];
  const nascidos = lista.filter((c) => c.nascimento);
  const hoje = nascidos.filter((c) => {
    const [, m, d] = c.nascimento.split('-').map(Number);
    return m === mes && d === dia;
  });
  const doMes = nascidos
    .filter((c) => Number(c.nascimento.split('-')[1]) === mes)
    .sort((a, b) => Number(a.nascimento.slice(8)) - Number(b.nascimento.slice(8)));
  const topo = [...lista].filter((c) => c.indicados > 0).sort((a, b) => b.indicados - a.indicados).slice(0, 5);
  const pendentes = lista.filter((c) => !c.whatsapp_confirmado_em);
  async function confirmar(c) {
    const { error } = await supa().rpc('fosco_admin_confirmar_whatsapp', { p_cliente: c.id });
    if (!error) recarregarClientes();
  }
  const modeloNiver = modelos.find((m) => m.chave === 'aniversario');

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">painel do estúdio</p>
          <h1 className="titulo mt-1 text-[52px]">Fala, {primeiroNome(usuario.nome) || 'equipe'}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="botao" onClick={() => irPara('clientes', { acao: 'sessao' })}>
            <IconeAgulha width={18} height={18} /> Registrar sessão
          </button>
          <button type="button" className="botao-linha" onClick={() => irPara('clientes', { acao: 'novo' })}>
            <IconeMais width={18} height={18} /> Cadastrar cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Numero rotulo="clientes" valor={resumo?.clientes ?? '–'} detalhe={resumo ? `+${resumo.novos_7d} nos últimos 7 dias` : ''} />
        <Numero rotulo="indicações" valor={resumo?.indicacoes_30d ?? '–'} detalhe="nos últimos 30 dias" />
        <Numero rotulo="sessões" valor={resumo?.sessoes_mes ?? '–'} detalhe="registradas este mês" />
      </div>

      <div className="grid gap-8">
        {pendentes.length > 0 && (
          <Secao titulo="Esperando confirmar o WhatsApp">
            <p className="mb-3 text-[14px] text-osso-3">Confirme quando chegar no WhatsApp do estúdio uma mensagem do número da pessoa (normalmente com o código). O ponto de quem indicou só entra depois disso.</p>
            <ul className="divide-y divide-osso/[0.07] rounded-2xl border border-ambar/40 bg-carvao/70">
              {pendentes.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <button type="button" onClick={() => irPara('clientes', { id: c.id })} className="min-w-0 flex-1 text-left">
                    <span className="block truncate font-semibold text-osso">{c.nome}</span>
                    <span className="block font-mono text-[12px] text-osso-3">
                      {mascaraZap(c.whatsapp)} · código {c.codigo_confirmacao || ''} · {haQuanto(c.criado_em)}{c.indicador_nome ? ` · indicado por ${c.indicador_nome}` : ''}
                    </span>
                  </button>
                  <a href={linkZap(c.whatsapp)} target="_blank" rel="noopener noreferrer" className="botao-mini"><IconeZap width={15} height={15} /> Abrir conversa</a>
                  <button type="button" className="botao-mini" onClick={() => confirmar(c)}>✓ Confirmar</button>
                </li>
              ))}
            </ul>
          </Secao>
        )}
        <Secao
          titulo="Aniversários"
          acao={doMes.length > 0 && (
            <button type="button" className="botao-mini" onClick={() => irPara('mensagens', { segmento: 'aniver_mes' })}>
              Mandar pra todos do mês
            </button>
          )}
        >
          {doMes.length === 0 ? (
            <Vazio>Ninguém faz aniversário este mês.</Vazio>
          ) : (
            <ul className="divide-y divide-osso/[0.07] rounded-2xl border border-osso/10 bg-carvao/70">
              {doMes.map((c) => {
                const ehHoje = hoje.includes(c);
                const texto = preencher(modeloNiver?.texto || 'Feliz aniversário, {nome}!', variaveis(c, config.estudio, config.programa));
                return (
                  <li key={c.id} className={`flex items-center justify-between gap-3 px-4 py-3 ${ehHoje ? 'bg-ambar/10' : ''}`}>
                    <button type="button" className="min-w-0 text-left" onClick={() => irPara('clientes', { id: c.id })}>
                      <span className="block truncate text-[15px] text-osso">
                        {ehHoje && <IconeBolo width={16} height={16} className="mr-1.5 inline text-ambar" />}
                        {c.nome}
                      </span>
                      <span className="font-mono text-[11.5px] text-osso-3">{ehHoje ? 'é hoje!' : diaMes(c.nascimento)}</span>
                    </button>
                    <a href={linkZap(c.whatsapp, texto)} target="_blank" rel="noopener noreferrer" className="botao-mini shrink-0">
                      <IconeZap width={15} height={15} /> Parabéns
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </Secao>

      </div>

      <Secao titulo="Quem mais indica">
        {topo.length === 0 ? (
          <Vazio>Quando os clientes começarem a indicar, o ranking aparece aqui.</Vazio>
        ) : (
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {topo.map((c, i) => (
              <li key={c.id}>
                <button type="button" onClick={() => irPara('clientes', { id: c.id })} className="w-full rounded-2xl border border-osso/10 bg-carvao/70 p-4 text-left hover:border-ambar/40">
                  <span className="font-mono text-[11px] text-ambar">#{i + 1}</span>
                  <span className="mt-1 block truncate text-[15px] text-osso">{c.nome}</span>
                  <span className="text-[13px] text-osso-3">
                    {c.indicados} {c.indicados === 1 ? 'indicação' : 'indicações'} · {mascaraZap(c.whatsapp)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </Secao>
    </div>
  );
}
