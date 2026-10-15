'use client';
import { useEffect, useMemo, useState } from 'react';
import { Campo } from '../Formulario';
import { IconeAgulha, IconeBusca, IconeLixo, IconeMais, IconeZap } from '../Icones';
import { Carregando, Chip, Interruptor, Janela, Vazio, useAvisar } from './ui';
import { contas, usePainel, variaveis } from './contexto';
import { funcao, supa, erroLegivel } from '@/lib/supabase';
import { dataCurta, diaMes, haQuanto, linkZap, mascaraCpf, mascaraZap, numero, preencher, reais, soDigitos, cpfValido } from '@/lib/formatos';

const MOTIVOS = { indicacao: 'Indicação', boas_vindas: 'Boas-vindas', indicado_tatuou: 'Indicado tatuou', resgate: 'Desconto usado', ajuste: 'Ajuste' };

export const FILTROS = [
  ['todos', 'Todos'],
  ['aniver_mes', 'Aniversário no mês'],
  ['com_desconto', 'Com desconto'],
  ['premio', 'Prêmio pra usar'],
  ['nunca_tatuou', 'Nunca tatuaram'],
  ['sumidos', 'Sumidos há 6+ meses'],
  ['novos', 'Novos (30 dias)'],
];

export function filtrar(lista, filtro, programa) {
  const mes = new Date().getMonth() + 1;
  const seisMeses = Date.now() - 182 * 86400000;
  const trintaDias = Date.now() - 30 * 86400000;
  return lista.filter((c) => {
    const k = contas(c, programa);
    switch (filtro) {
      case 'aniver_mes':
        return c.nascimento && Number(c.nascimento.split('-')[1]) === mes;
      case 'com_desconto':
        return k.desconto > 0;
      case 'premio':
        return k.premios > 0;
      case 'nunca_tatuou':
        return c.sessoes === 0;
      case 'sumidos':
        return c.ultima_sessao && new Date(c.ultima_sessao).getTime() < seisMeses;
      case 'novos':
        return new Date(c.criado_em).getTime() > trintaDias;
      default:
        return true;
    }
  });
}

// ------------------------------------------------------------------ sessão
function FormSessao({ detalhe, aoSalvar }) {
  const { artistas, config, modelos } = usePainel();
  const [feita, setFeita] = useState(false);
  const avisar = useAvisar();
  const hoje = new Date().toLocaleDateString('sv-SE');
  const [f, setF] = useState({ artista: '', data: hoje, valor: '', descricao: '', conta: true, desconto: false, premio: false });
  const [salvando, setSalvando] = useState(false);
  const temDesconto = Number(detalhe.desconto) > 0;
  const temPremio = detalhe.fidelidade.disponiveis > 0;
  const valor = Number(String(f.valor).replace(/\./g, '').replace(',', '.')) || 0;
  const final = Math.max(0, valor * (1 - (f.desconto ? Number(detalhe.desconto) : 0) / 100) - (f.premio ? Number(detalhe.fidelidade.premio) : 0));

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    const { data, error } = await supa().rpc('fosco_admin_registrar_sessao', {
      p_cliente: detalhe.cliente.id,
      p_artista: f.artista || null,
      p_data: f.data || null,
      p_valor: valor || null,
      p_descricao: f.descricao,
      p_conta_fidelidade: f.conta,
      p_usar_desconto: f.desconto,
      p_usar_premio: f.premio,
    });
    setSalvando(false);
    if (error) return avisar(erroLegivel(error), 'erro');
    const partes = ['Sessão registrada'];
    if (Number(data.desconto_percentual) > 0) partes.push(`${numero(data.desconto_percentual)}% de desconto usado`);
    if (Number(data.premio_valor) > 0) partes.push(`prêmio de ${reais(data.premio_valor)} usado`);
    if (data.valor_final !== null) partes.push(`valor final ${reais(data.valor_final, true)}`);
    avisar(partes.join(' · '));
    setFeita(true);
    setF({ ...f, valor: '', descricao: '', desconto: false, premio: false });
    aoSalvar();
  }

  return (
    <form onSubmit={salvar} className="space-y-4 rounded-2xl border border-ambar/30 bg-ambar/[0.05] p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Campo rotulo="Artista" id="s-art">
          <select id="s-art" className="campo" value={f.artista} onChange={(e) => setF({ ...f, artista: e.target.value })}>
            <option value="">—</option>
            {artistas.map((a, i) => (
              <option key={a.id} value={a.id}>
                {a.nome || `Retrato ${i + 1} (sem nome)`}
              </option>
            ))}
          </select>
        </Campo>
        <Campo rotulo="Data" id="s-data">
          <input id="s-data" type="date" className="campo" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} />
        </Campo>
        <Campo rotulo="Valor (R$)" id="s-valor">
          <input id="s-valor" className="campo" inputMode="decimal" value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value.replace(/[^\d.,]/g, '') })} placeholder="opcional" />
        </Campo>
      </div>
      <Campo rotulo="O que foi feito" id="s-desc">
        <input id="s-desc" className="campo" value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} placeholder="ex.: carpa no antebraço, 2ª sessão" />
      </Campo>
      <div className="space-y-3">
        <Interruptor ligado={f.conta} aoMudar={(v) => setF({ ...f, conta: v })} rotulo="Conta pro cartão fidelidade" />
        {temDesconto && (
          <Interruptor
            ligado={f.desconto}
            aoMudar={(v) => setF({ ...f, desconto: v })}
            rotulo={`Usar o desconto de ${numero(detalhe.desconto)}% (indicações)`}
            dica={`Gasta os pontos correspondentes. Ficam ${Math.max(0, detalhe.pontos - Math.ceil(Number(detalhe.desconto) / Number(config.programa.percentual_por_ponto || 1)))} pontos.`}
          />
        )}
        {temPremio && (
          <Interruptor ligado={f.premio} aoMudar={(v) => setF({ ...f, premio: v })} rotulo={`Usar o prêmio de ${reais(detalhe.fidelidade.premio)} (cartão completo)`} />
        )}
      </div>
      {valor > 0 && (f.desconto || f.premio) && (
        <p className="text-[14px] text-osso-2">
          Valor final: <b className="text-ambar-claro">{reais(final, true)}</b> <span className="text-osso-3">(de {reais(valor, true)})</span>
        </p>
      )}
      <button type="submit" className="botao" disabled={salvando}>
        <IconeAgulha width={18} height={18} /> {salvando ? 'Salvando...' : 'Registrar sessão'}
      </button>
      {feita && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-osso/10 bg-noite/60 p-3">
          <span className="flex-1 text-[14px] text-osso-2">Sessão salva. Quer mandar os cuidados com a tattoo nova?</span>
          <a
            href={linkZap(
              detalhe.cliente.whatsapp,
              preencher(modelos.find((m) => m.chave === 'cuidados')?.texto || 'Oi, {nome}! Os cuidados com a tattoo nova: {link_cuidados}', variaveis(detalhe.cliente, config.estudio, config.programa)),
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="botao-mini"
          >
            <IconeZap width={15} height={15} /> Mandar os cuidados
          </a>
        </div>
      )}
    </form>
  );
}

// ------------------------------------------------------------------ senha gerada
function SenhaGerada({ senha, cliente, chaveModelo }) {
  const { modelos, config } = usePainel();
  const modelo = modelos.find((m) => m.chave === chaveModelo);
  const texto = preencher(modelo?.texto || 'Sua senha do Fosco: {senha}', variaveis(cliente, config.estudio, config.programa, { senha }));
  return (
    <div className="rounded-2xl border border-ambar/40 bg-ambar/10 p-4">
      <p className="text-[14px] text-osso-2">Senha gerada (só aparece agora):</p>
      <p className="mt-1 font-mono text-[26px] font-semibold tracking-wider text-ambar-claro">{senha}</p>
      <a href={linkZap(cliente.whatsapp, texto)} target="_blank" rel="noopener noreferrer" className="botao mt-3">
        <IconeZap width={18} height={18} /> Mandar pro cliente no WhatsApp
      </a>
    </div>
  );
}

// ------------------------------------------------------------------ detalhe
function Detalhe({ id, aoFechar, abrirOutro, sessaoAberta }) {
  const { config, recarregarClientes } = usePainel();
  const avisar = useAvisar();
  const [d, setD] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(null);
  const [verSessao, setVerSessao] = useState(!!sessaoAberta);
  const [ajuste, setAjuste] = useState({ pontos: '', obs: '' });
  const [senha, setSenha] = useState('');

  async function carregar() {
    const { data, error } = await supa().rpc('fosco_admin_cliente', { p_id: id });
    if (error) return avisar(erroLegivel(error), 'erro');
    setD(data);
    const c = data.cliente;
    setForm({ nome: c.nome, whatsapp: mascaraZap(c.whatsapp), email: c.email || '', nascimento: c.nascimento || '', aceita_promocoes: c.aceita_promocoes, notas: c.notas || '' });
  }
  useEffect(() => {
    setD(null);
    setSenha('');
    carregar();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const atualizar = () => {
    carregar();
    recarregarClientes();
  };

  async function salvarDados(e) {
    e.preventDefault();
    const w = soDigitos(form.whatsapp).replace(/^55(?=\d{10,11}$)/, '');
    const { error } = await supa()
      .from('fosco_clientes')
      .update({ nome: form.nome.trim(), whatsapp: w, email: form.email.trim().toLowerCase() || null, nascimento: form.nascimento || null, aceita_promocoes: form.aceita_promocoes, notas: form.notas })
      .eq('id', id);
    if (error) return avisar(/whatsapp_key/.test(error.message) ? 'Esse WhatsApp já está em outro cadastro.' : erroLegivel(error), 'erro');
    avisar('Dados salvos');
    setEditando(false);
    atualizar();
  }

  async function ajustarPontos(e) {
    e.preventDefault();
    const p = parseInt(ajuste.pontos, 10);
    if (!p) return;
    const { error } = await supa().rpc('fosco_admin_ajustar_pontos', { p_cliente: id, p_pontos: p, p_obs: ajuste.obs });
    if (error) return avisar(erroLegivel(error), 'erro');
    avisar(`${p > 0 ? '+' : ''}${p} pontos`);
    setAjuste({ pontos: '', obs: '' });
    atualizar();
  }

  async function apagarSessao(s) {
    if (!confirm(`Apagar a sessão de ${dataCurta(s.data)}? Se ela usou desconto, os pontos voltam.`)) return;
    const { error } = await supa().rpc('fosco_admin_apagar_sessao', { p_id: s.id });
    if (error) return avisar(erroLegivel(error), 'erro');
    avisar('Sessão apagada');
    atualizar();
  }

  async function novaSenha() {
    if (!confirm('Gerar uma senha nova? A antiga para de funcionar.')) return;
    const { dados, erro } = await funcao('fosco-admin', { acao: 'nova_senha', cliente_id: id });
    if (erro) return avisar(erro, 'erro');
    setSenha(dados.senha);
  }

  async function apagar() {
    const nome = d.cliente.nome;
    if (!confirm(`Apagar o cadastro de ${nome}? Some o extrato, as sessões e o ponto que ele rendeu pra quem indicou. Não dá pra desfazer.`)) return;
    const { erro } = await funcao('fosco-admin', { acao: 'excluir_cliente', cliente_id: id });
    if (erro) return avisar(erro, 'erro');
    avisar('Cadastro apagado');
    recarregarClientes();
    aoFechar();
  }

  if (!d) return <Carregando />;
  const c = d.cliente;
  const fid = d.fidelidade;

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11.5px] text-osso-3">
            código {c.codigo} · CPF {mascaraCpf(c.cpf)} · {c.origem === 'estudio' ? 'cadastrado pelo estúdio' : 'cadastrou pelo site'} {haQuanto(c.criado_em)}
          </p>
          <p className="mt-1 text-[15px] text-osso-2">
            {mascaraZap(c.whatsapp)}
            {c.email ? ` · ${c.email}` : ''}
            {c.nascimento ? ` · aniversário ${diaMes(c.nascimento)}` : ''}
          </p>
          {!c.aceita_promocoes && <p className="mt-1 text-[12.5px] text-osso-3">Não marcou que aceita receber promoções.</p>}
          {d.indicador && (
            <button type="button" onClick={() => abrirOutro(d.indicador.id)} className="mt-1 text-[13.5px] text-ambar-claro underline underline-offset-4">
              Indicado por {d.indicador.nome}
            </button>
          )}
        </div>
        <a href={linkZap(c.whatsapp)} target="_blank" rel="noopener noreferrer" className="botao-mini">
          <IconeZap width={15} height={15} /> Conversar
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-osso/10 bg-noite/60 p-3 text-center">
          <div className="font-gotica text-[34px] font-bold leading-none">{numero(d.desconto)}%</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-osso-3">{d.pontos} pontos</div>
        </div>
        <div className="rounded-2xl border border-osso/10 bg-noite/60 p-3 text-center">
          <div className="font-gotica text-[34px] font-bold leading-none">
            {fid.no_cartao}/{fid.necessarias}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-osso-3">cartão</div>
        </div>
        <div className={`rounded-2xl border p-3 text-center ${fid.disponiveis > 0 ? 'border-ambar/50 bg-ambar/10' : 'border-osso/10 bg-noite/60'}`}>
          <div className="font-gotica text-[34px] font-bold leading-none">{fid.disponiveis}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-osso-3">prêmio pra usar</div>
        </div>
      </div>

      <div>
        {verSessao ? (
          <FormSessao detalhe={d} aoSalvar={atualizar} />
        ) : (
          <button type="button" className="botao w-full" onClick={() => setVerSessao(true)}>
            <IconeAgulha width={18} height={18} /> Registrar sessão
          </button>
        )}
      </div>

      {senha && <SenhaGerada senha={senha} cliente={c} chaveModelo="nova_senha" />}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="kicker mb-2">sessões · {d.sessoes.length}</h4>
          {d.sessoes.length === 0 ? (
            <p className="text-[14px] text-osso-3">Nenhuma sessão registrada.</p>
          ) : (
            <ul className="max-h-64 divide-y divide-osso/[0.07] overflow-y-auto rounded-xl border border-osso/10">
              {d.sessoes.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 px-3 py-2 text-[14px]">
                  <span>
                    {dataCurta(s.data)} {s.artista ? `· ${s.artista}` : ''}
                    <span className="block text-[12px] text-osso-3">
                      {[s.descricao, s.valor ? reais(s.valor) : '', Number(s.desconto_percentual) ? `-${numero(s.desconto_percentual)}%` : '', Number(s.premio_valor) ? `prêmio ${reais(s.premio_valor)}` : '', s.conta_fidelidade ? '' : 'fora do cartão']
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  <button type="button" onClick={() => apagarSessao(s)} className="rounded-full p-1.5 text-osso-3 hover:text-[#f0a596]" aria-label="Apagar sessão">
                    <IconeLixo width={16} height={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4 className="kicker mb-2">indicou · {d.indicados.length}</h4>
          {d.indicados.length === 0 ? (
            <p className="text-[14px] text-osso-3">Ninguém ainda.</p>
          ) : (
            <ul className="max-h-64 divide-y divide-osso/[0.07] overflow-y-auto rounded-xl border border-osso/10">
              {d.indicados.map((i) => (
                <li key={i.id}>
                  <button type="button" onClick={() => abrirOutro(i.id)} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[14px] hover:bg-osso/[0.03]">
                    <span>
                      {i.nome}
                      <span className="block font-mono text-[11.5px] text-osso-3">
                        {mascaraZap(i.whatsapp)} · {dataCurta(i.criado_em)}
                      </span>
                    </span>
                    {i.tatuou && <span className="rounded-full bg-ambar/15 px-2 py-0.5 font-mono text-[10.5px] text-ambar-claro">tatuou</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h4 className="kicker mb-2">extrato de pontos</h4>
        {d.extrato.length === 0 ? (
          <p className="text-[14px] text-osso-3">Sem movimento.</p>
        ) : (
          <ul className="max-h-56 divide-y divide-osso/[0.07] overflow-y-auto rounded-xl border border-osso/10">
            {d.extrato.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 px-3 py-2 text-[14px]">
                <span>
                  {MOTIVOS[e.motivo] || e.motivo}
                  <span className="block text-[12px] text-osso-3">{[e.indicado, e.observacao, dataCurta(e.criado_em)].filter(Boolean).join(' · ')}</span>
                </span>
                <span className={`font-mono font-semibold ${e.pontos > 0 ? 'text-[#9fc98a]' : 'text-[#f0a596]'}`}>
                  {e.pontos > 0 ? '+' : ''}
                  {e.pontos}
                </span>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={ajustarPontos} className="mt-3 flex flex-wrap items-end gap-2">
          <Campo rotulo="Ajustar pontos" id="aj-p" className="w-28">
            <input id="aj-p" className="campo py-2" inputMode="numeric" value={ajuste.pontos} onChange={(e) => setAjuste({ ...ajuste, pontos: e.target.value.replace(/[^\d-]/g, '') })} placeholder="+5 ou -3" />
          </Campo>
          <Campo rotulo="Motivo" id="aj-o" className="min-w-[10rem] flex-1">
            <input id="aj-o" className="campo py-2" value={ajuste.obs} onChange={(e) => setAjuste({ ...ajuste, obs: e.target.value })} placeholder="ex.: cortesia" />
          </Campo>
          <button type="submit" className="botao-mini mb-1">
            Lançar
          </button>
        </form>
      </div>

      <div className="border-t border-osso/10 pt-5">
        {editando ? (
          <form onSubmit={salvarDados} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo rotulo="Nome" id="e-nome">
                <input id="e-nome" className="campo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              </Campo>
              <Campo rotulo="WhatsApp" id="e-zap">
                <input id="e-zap" className="campo" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: mascaraZap(e.target.value) })} />
              </Campo>
              <Campo rotulo="E-mail" id="e-email">
                <input id="e-email" className="campo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Campo>
              <Campo rotulo="Nascimento" id="e-nasc">
                <input id="e-nasc" type="date" className="campo" value={form.nascimento} onChange={(e) => setForm({ ...form, nascimento: e.target.value })} />
              </Campo>
            </div>
            <Campo rotulo="Anotações do estúdio (o cliente não vê)" id="e-notas">
              <textarea id="e-notas" className="campo min-h-[80px]" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            </Campo>
            <Interruptor ligado={form.aceita_promocoes} aoMudar={(v) => setForm({ ...form, aceita_promocoes: v })} rotulo="Aceita receber promoções" />
            <div className="flex gap-2">
              <button type="submit" className="botao">
                Salvar
              </button>
              <button type="button" className="botao-linha" onClick={() => setEditando(false)}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap gap-2">
            {c.notas && <p className="mb-2 w-full rounded-xl bg-noite/60 p-3 text-[14px] text-osso-2">{c.notas}</p>}
            <button type="button" className="botao-mini" onClick={() => setEditando(true)}>
              Editar dados
            </button>
            <button type="button" className="botao-mini" onClick={novaSenha}>
              Gerar senha nova
            </button>
            <button type="button" className="botao-perigo" onClick={apagar}>
              Apagar cadastro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ novo cliente
function NovoCliente({ aoCriar }) {
  const { clientes, recarregarClientes } = usePainel();
  const avisar = useAvisar();
  const [f, setF] = useState({ nome: '', cpf: '', whatsapp: '', nascimento: '', email: '', aceita_promocoes: true, indicado_por: '' });
  const [busca, setBusca] = useState('');
  const [criado, setCriado] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const sugestoes = busca.length >= 2 ? (clientes || []).filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase()) || c.codigo.includes(busca.toLowerCase())).slice(0, 5) : [];
  const indicador = (clientes || []).find((c) => c.id === f.indicado_por);

  async function criar(e) {
    e.preventDefault();
    if (!cpfValido(f.cpf)) return avisar('CPF inválido.', 'erro');
    setSalvando(true);
    const { dados, erro } = await funcao('fosco-admin', { acao: 'criar_cliente', ...f });
    setSalvando(false);
    if (erro) return avisar(erro, 'erro');
    setCriado({ senha: dados.senha, cliente: { nome: f.nome, whatsapp: soDigitos(f.whatsapp), codigo: dados.codigo } });
    recarregarClientes();
    aoCriar?.(dados.id);
  }

  if (criado) {
    return (
      <div className="space-y-4">
        <p className="text-[15px] text-osso-2">
          <b className="text-osso">{criado.cliente.nome}</b> cadastrado. Mande o acesso: com CPF e essa senha a pessoa entra, vê os pontos e pega o link dela.
        </p>
        <SenhaGerada senha={criado.senha} cliente={criado.cliente} chaveModelo="acesso_novo" />
      </div>
    );
  }

  return (
    <form onSubmit={criar} className="space-y-4">
      <p className="text-[14px] text-osso-3">Para quem já tatua com vocês e ainda não tem cadastro no site.</p>
      <Campo rotulo="Nome completo" id="n-nome">
        <input id="n-nome" className="campo" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} required />
      </Campo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="CPF" id="n-cpf">
          <input id="n-cpf" className="campo font-mono" inputMode="numeric" value={f.cpf} onChange={(e) => setF({ ...f, cpf: mascaraCpf(e.target.value) })} required />
        </Campo>
        <Campo rotulo="WhatsApp" id="n-zap">
          <input id="n-zap" className="campo" inputMode="tel" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: mascaraZap(e.target.value) })} required />
        </Campo>
        <Campo rotulo="Nascimento" id="n-nasc">
          <input id="n-nasc" type="date" className="campo" value={f.nascimento} onChange={(e) => setF({ ...f, nascimento: e.target.value })} />
        </Campo>
        <Campo rotulo="E-mail" id="n-email">
          <input id="n-email" type="email" className="campo" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Campo>
      </div>
      <Campo rotulo="Indicado por (opcional)" id="n-ind" dica={indicador ? `Quem indicou ganha o ponto: ${indicador.nome}` : 'Busque pelo nome ou código de quem indicou.'}>
        {indicador ? (
          <button type="button" className="botao-mini" onClick={() => setF({ ...f, indicado_por: '' })}>
            {indicador.nome} ✕
          </button>
        ) : (
          <div className="relative">
            <input id="n-ind" className="campo" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="nome ou código" autoComplete="off" />
            {sugestoes.length > 0 && (
              <ul className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-osso/15 bg-fuligem">
                {sugestoes.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left text-[14px] hover:bg-osso/[0.06]"
                      onClick={() => {
                        setF({ ...f, indicado_por: s.id });
                        setBusca('');
                      }}
                    >
                      {s.nome} <span className="font-mono text-[11px] text-osso-3">{s.codigo}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Campo>
      <Interruptor ligado={f.aceita_promocoes} aoMudar={(v) => setF({ ...f, aceita_promocoes: v })} rotulo="A pessoa aceita receber promoções" dica="Pergunte antes de marcar." />
      <button type="submit" className="botao w-full" disabled={salvando}>
        {salvando ? 'Cadastrando...' : 'Cadastrar e gerar senha'}
      </button>
    </form>
  );
}

// ------------------------------------------------------------------ lista
export default function Clientes() {
  const { clientes, config, foco, setFoco } = usePainel();
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [aberto, setAberto] = useState(null);
  const [sessaoAberta, setSessaoAberta] = useState(false);
  const [novo, setNovo] = useState(false);
  const [escolher, setEscolher] = useState(false);

  useEffect(() => {
    if (!foco) return;
    if (foco.id) setAberto(foco.id);
    if (foco.acao === 'novo') setNovo(true);
    if (foco.acao === 'sessao') setEscolher(true);
    setFoco(null);
  }, [foco, setFoco]);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const qd = soDigitos(q);
    return filtrar(clientes || [], filtro, config.programa).filter(
      (c) => !q || c.nome.toLowerCase().includes(q) || c.codigo.includes(q) || (qd.length >= 3 && (c.cpf.includes(qd) || c.whatsapp.includes(qd))),
    );
  }, [clientes, busca, filtro, config.programa]);

  if (!clientes) return <Carregando />;
  const nomeAberto = clientes.find((c) => c.id === aberto)?.nome || 'Cliente';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">{clientes.length} cadastrados</p>
          <h1 className="titulo mt-1 text-[48px]">Clientes</h1>
        </div>
        <button type="button" className="botao" onClick={() => setNovo(true)}>
          <IconeMais width={18} height={18} /> Cadastrar cliente
        </button>
      </div>

      <div className="relative">
        <IconeBusca className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-osso-3" />
        <input className="campo pl-11" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, CPF, WhatsApp ou código" />
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTROS.map(([id, rotulo]) => (
          <Chip key={id} ativo={filtro === id} aoClicar={() => setFiltro(id)} conta={id === 'todos' ? undefined : filtrar(clientes, id, config.programa).length}>
            {rotulo}
          </Chip>
        ))}
      </div>

      {lista.length === 0 ? (
        <Vazio>{clientes.length === 0 ? 'Ainda não tem ninguém cadastrado. Comece pelos clientes que já tatuaram com vocês.' : 'Ninguém com esse filtro.'}</Vazio>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2">
          {lista.map((c) => {
            const k = contas(c, config.programa);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSessaoAberta(false);
                    setAberto(c.id);
                  }}
                  className="w-full rounded-2xl border border-osso/10 bg-carvao/70 p-4 text-left transition hover:border-ambar/40"
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-[16px] font-semibold text-osso">{c.nome}</span>
                      <span className="font-mono text-[12px] text-osso-3">
                        {mascaraZap(c.whatsapp)} · {c.codigo}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-gotica text-[26px] font-bold leading-none text-ambar-claro">{numero(k.desconto)}%</span>
                      <span className="font-mono text-[10.5px] text-osso-3">{c.pontos} pts</span>
                    </span>
                  </span>
                  <span className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px]">
                    <span className="flex gap-0.5" aria-label={`${k.noCartao} de ${k.n} no cartão`}>
                      {Array.from({ length: k.n }, (_, i) => (
                        <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < k.noCartao ? 'bg-selo' : 'bg-osso/15'}`} />
                      ))}
                    </span>
                    {k.premios > 0 && <span className="rounded-full bg-selo/25 px-2 py-0.5 text-[#f4b3a6]">prêmio pra usar</span>}
                    {c.indicados > 0 && <span className="rounded-full bg-osso/10 px-2 py-0.5 text-osso-2">{c.indicados} indicados</span>}
                    {c.sessoes === 0 && <span className="rounded-full bg-osso/10 px-2 py-0.5 text-osso-3">nunca tatuou</span>}
                    {c.ultima_sessao && <span className="text-osso-3">última sessão {dataCurta(c.ultima_sessao)}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Janela aberta={!!aberto} aoFechar={() => setAberto(null)} titulo={nomeAberto} larga>
        {aberto && <Detalhe key={aberto} id={aberto} aoFechar={() => setAberto(null)} abrirOutro={(id) => setAberto(id)} sessaoAberta={sessaoAberta} />}
      </Janela>
      <Janela aberta={novo} aoFechar={() => setNovo(false)} titulo="Cadastrar cliente">
        <NovoCliente />
      </Janela>
      <Janela aberta={escolher} aoFechar={() => setEscolher(false)} titulo="Registrar sessão: de quem?">
        <Escolher
          aoEscolher={(id) => {
            setEscolher(false);
            setSessaoAberta(true);
            setAberto(id);
          }}
          aoNovo={() => {
            setEscolher(false);
            setNovo(true);
          }}
        />
      </Janela>
    </div>
  );
}

function Escolher({ aoEscolher, aoNovo }) {
  const { clientes } = usePainel();
  const [q, setQ] = useState('');
  const qd = soDigitos(q);
  const achados = q.length < 2 ? [] : (clientes || []).filter((c) => c.nome.toLowerCase().includes(q.toLowerCase()) || c.codigo.includes(q.toLowerCase()) || (qd.length >= 3 && (c.cpf.includes(qd) || c.whatsapp.includes(qd)))).slice(0, 8);
  return (
    <div className="space-y-3">
      <input className="campo" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="nome, CPF, WhatsApp ou código" />
      <ul className="divide-y divide-osso/[0.07]">
        {achados.map((c) => (
          <li key={c.id}>
            <button type="button" className="w-full py-2.5 text-left text-[15px] hover:text-ambar-claro" onClick={() => aoEscolher(c.id)}>
              {c.nome} <span className="font-mono text-[12px] text-osso-3">{mascaraZap(c.whatsapp)}</span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="botao-mini" onClick={aoNovo}>
        Não tem cadastro? Cadastrar agora
      </button>
    </div>
  );
}
