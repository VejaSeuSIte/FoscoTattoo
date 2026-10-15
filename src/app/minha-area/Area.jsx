'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Regua from '@/components/Regua';
import Marca from '@/components/Marca';
import CartaoFidelidade from '@/components/CartaoFidelidade';
import { Aviso, Campo, CampoSenha } from '@/components/Formulario';
import { IconeCheck, IconeCompartilhar, IconeCopiar, IconeSair, IconeZap } from '@/components/Icones';
import { supa, erroLegivel } from '@/lib/supabase';
import { useVitrine } from '@/lib/vitrine';
import { dataCurta, haQuanto, linkIndicacao, linkOrcamento, linkZap, mascaraZap, numero, primeiroNome, reais } from '@/lib/formatos';

const MOTIVOS = {
  indicacao: 'Indicação',
  boas_vindas: 'Boas-vindas',
  indicado_tatuou: 'Seu indicado tatuou',
  resgate: 'Desconto usado',
  ajuste: 'Ajuste do estúdio',
};

function Bloco({ titulo, kicker, children, className = '' }) {
  return (
    <section className={`cartao p-5 sm:p-7 ${className}`}>
      {kicker && <p className="kicker">{kicker}</p>}
      {titulo && <h2 className="mt-1 font-gotica text-[30px] font-semibold leading-tight">{titulo}</h2>}
      <div className={titulo || kicker ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}

function Compartilhar({ codigo, nome }) {
  const [copiou, setCopiou] = useState(false);
  const link = linkIndicacao(codigo);
  const mensagem = `Bora tatuar no Fosco? Faz teu cadastro pelo meu link que a gente ganha desconto: ${link}`;
  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const t = document.createElement('textarea');
      t.value = link;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopiou(true);
    setTimeout(() => setCopiou(false), 2200);
  }
  async function compartilhar() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Fosco Tattoo Studio', text: `Bora tatuar no Fosco? Faz teu cadastro pelo meu link (${nome}):`, url: link });
      } catch {}
    } else copiar();
  }
  return (
    <div>
      <div className="relative flex items-center gap-2 rounded-xl border-2 border-dashed border-ambar/60 bg-noite/70 p-2 pl-4">
        <svg viewBox="0 0 24 24" className="absolute -left-3 -top-3 h-6 w-6 -rotate-12 bg-carvao text-ambar" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
          <circle cx="6" cy="7" r="2.6" />
          <circle cx="6" cy="17" r="2.6" />
          <path d="M8.2 8.4L20 16M8.2 15.6L20 8" />
        </svg>
        <span className="min-w-0 flex-1 truncate font-mono text-[13.5px] text-ambar-claro">{link.replace(/^https?:\/\//, '')}</span>
        <button type="button" onClick={copiar} className="botao-mini shrink-0">
          {copiou ? <IconeCheck width={16} height={16} /> : <IconeCopiar width={16} height={16} />}
          {copiou ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a href={linkZap('', mensagem)} target="_blank" rel="noopener noreferrer" className="botao py-3 text-[14px]">
          <IconeZap width={18} height={18} /> WhatsApp
        </a>
        <button type="button" onClick={compartilhar} className="botao-linha py-3 text-[14px]">
          <IconeCompartilhar width={18} height={18} /> Compartilhar
        </button>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-osso-3">
        No direct do Instagram dá pra mandar o link pra várias pessoas de uma vez: copia e cola na conversa.
      </p>
    </div>
  );
}

function MeusDados({ cliente, aoSalvar }) {
  const [zap, setZap] = useState(mascaraZap(cliente.whatsapp));
  const [email, setEmail] = useState(cliente.email || '');
  const [aceita, setAceita] = useState(cliente.aceita_promocoes);
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState(null);
  const [salvando, setSalvando] = useState(false);
  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setMsg(null);
    const db = supa();
    const { error } = await db.rpc('fosco_atualizar_meus_dados', { p_whatsapp: zap, p_email: email, p_aceita: aceita });
    if (error) {
      setSalvando(false);
      return setMsg({ tipo: 'erro', t: erroLegivel(error) });
    }
    if (senha) {
      if (senha.length < 6) {
        setSalvando(false);
        return setMsg({ tipo: 'erro', t: 'A senha nova precisa ter pelo menos 6 caracteres.' });
      }
      const { error: e2 } = await db.auth.updateUser({ password: senha });
      if (e2) {
        setSalvando(false);
        return setMsg({ tipo: 'erro', t: erroLegivel(e2) });
      }
      setSenha('');
    }
    setSalvando(false);
    setMsg({ tipo: 'ok', t: 'Tudo salvo.' });
    aoSalvar();
  }
  return (
    <form onSubmit={salvar} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo rotulo="WhatsApp" id="m-zap">
          <input id="m-zap" className="campo" inputMode="tel" value={zap} onChange={(e) => setZap(mascaraZap(e.target.value))} />
        </Campo>
        <Campo rotulo="E-mail" id="m-email">
          <input id="m-email" type="email" className="campo" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Campo>
      </div>
      <Campo rotulo="Senha nova (se quiser trocar)" id="m-senha">
        <CampoSenha id="m-senha" valor={senha} aoMudar={setSenha} autoComplete="new-password" placeholder="deixe em branco pra manter" />
      </Campo>
      <label className="flex cursor-pointer items-start gap-3 text-[14.5px] text-osso-2">
        <input type="checkbox" className="caixa mt-0.5" checked={aceita} onChange={(e) => setAceita(e.target.checked)} />
        Quero receber vagas com desconto, aviso de aniversário e novidades do Fosco.
      </label>
      {msg && <Aviso tipo={msg.tipo}>{msg.t}</Aviso>}
      <button type="submit" className="botao" disabled={salvando}>
        {salvando ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}

export default function Area() {
  const router = useRouter();
  const { programa, estudio } = useVitrine();
  const [area, setArea] = useState(null);
  const [estado, setEstado] = useState('carregando');
  const [novo, setNovo] = useState(false);

  const carregar = useCallback(async () => {
    const db = supa();
    const { data: s } = await db.auth.getSession();
    if (!s?.session) {
      router.replace('/entrar/');
      return;
    }
    const { data, error } = await db.rpc('fosco_minha_area');
    if (error) {
      setEstado('erro');
      return;
    }
    if (!data) {
      setEstado('sem-cliente');
      return;
    }
    setArea(data);
    setEstado('pronto');
  }, [router]);

  useEffect(() => {
    setNovo(new URLSearchParams(window.location.search).has('novo'));
    carregar();
  }, [carregar]);

  async function sair() {
    await supa().auth.signOut();
    router.replace('/entrar/');
  }

  if (estado === 'carregando') {
    return <div className="mx-auto max-w-5xl px-4 py-24 text-center font-mono text-[13px] text-osso-3">abrindo sua área...</div>;
  }
  if (estado !== 'pronto') {
    return (
      <div className="mx-auto max-w-md px-4 text-center">
        <Aviso>{estado === 'erro' ? 'Não deu pra abrir sua área agora. Tente de novo em instantes.' : 'Essa conta não é de cliente.'}</Aviso>
        <button type="button" onClick={sair} className="botao-linha mt-6">
          Sair
        </button>
      </div>
    );
  }

  const { cliente, pontos, desconto, regras, indicados, extrato, fidelidade, sessoes } = area;
  const max = Number(regras.desconto_maximo);
  const porAmigo = Number(regras.pontos_por_indicacao) * Number(regras.percentual_por_ponto);
  const tatuaram = indicados.filter((i) => i.tatuou).length;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_380px]">
        <div>
          <h1 className="titulo text-[clamp(52px,10vw,84px)]">E aí, {primeiroNome(cliente.nome)}</h1>
          <button type="button" onClick={sair} className="botao-mini mt-4">
            <IconeSair width={16} height={16} /> Sair
          </button>
        </div>
        {/* a carteirinha do cliente, com o desconto carimbado */}
        <div className="papel relative overflow-hidden rounded-xl px-6 py-5" style={{ transform: 'rotate(-1.5deg)' }}>
          <div className="flex items-center gap-2.5">
            <Marca className="h-10 w-auto text-papel-tinta" titulo="" />
            <div className="leading-none">
              <div className="font-gotica text-[22px] font-bold text-papel-tinta">Carteirinha Fosco</div>
              <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#6b5640]">cliente desde {dataCurta(cliente.criado_em)}</div>
            </div>
          </div>
          <div className="mt-4 pr-24 font-gotica text-[28px] font-bold leading-[1.02] text-papel-tinta sm:text-[32px]">{cliente.nome}</div>
          <div className="mt-2 font-mono text-[13px] text-[#6b5640]">código {cliente.codigo}</div>
          <div
            className="absolute -right-1 bottom-3 flex h-[86px] w-[86px] rotate-[-14deg] flex-col items-center justify-center rounded-full border-[3px] border-double border-selo-escuro text-center leading-none text-selo-escuro"
            aria-label={`Desconto atual: ${numero(desconto)}%`}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.16em]">desconto</span>
            <span className="font-gotica text-[34px] font-bold">{numero(desconto)}%</span>
          </div>
        </div>
      </div>
      {novo && (
        <div className="mt-6">
          <Aviso tipo="ok">Cadastro feito! Seu link já está pronto aqui embaixo: manda pros amigos e acompanhe o desconto subindo.</Aviso>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <Bloco kicker="seu desconto">
          <div className="flex items-end gap-4">
            <div className="font-gotica text-[88px] font-bold leading-[0.8] text-osso">
              {numero(desconto)}
              <span className="text-ambar">%</span>
            </div>
            <div className="pb-1 text-[14px] leading-snug text-osso-3">
              {pontos} {pontos === 1 ? 'ponto' : 'pontos'}
              <br />
              {numero(porAmigo)}% por amigo · até {max}%
            </div>
          </div>
          <Regua valor={desconto} maximo={max} marcos={[Math.round(max / 2), max]} legenda={(m) => `${Math.ceil(m / porAmigo)} amigos`} className="mt-4" />
          <p className="mt-2 text-[14px] leading-relaxed text-osso-2">
            {desconto >= max
              ? 'Você chegou no máximo! Avise no estúdio que quer usar na próxima sessão.'
              : desconto > 0
                ? `Pra usar, é só avisar no estúdio na hora da sessão. Faltam ${Math.ceil((max - desconto) / porAmigo)} amigos pra chegar em ${max}%.`
                : 'Mande seu link: cada amigo que se cadastrar por ele aparece aqui.'}
          </p>
        </Bloco>

        <Bloco kicker="seu link de indicação" titulo="Manda pra galera">
          <Compartilhar codigo={cliente.codigo} nome={primeiroNome(cliente.nome)} />
        </Bloco>
      </div>

      {programa.fidelidade_ativa !== false && (
        <div className="mt-6 grid items-center gap-8 rounded-2xl border border-osso/10 bg-noite/50 p-5 sm:p-8 lg:grid-cols-[1.2fr_1fr]">
          <CartaoFidelidade total={fidelidade.necessarias} carimbos={fidelidade.disponiveis > 0 && fidelidade.no_cartao === 0 ? fidelidade.necessarias : fidelidade.no_cartao} premio={fidelidade.premio} animar giro={-0.8} />
          <div>
            <p className="kicker">cartão fidelidade</p>
            {fidelidade.disponiveis > 0 ? (
              <h2 className="mt-1 font-gotica text-[34px] font-semibold leading-tight">
                Você tem <span className="brasa dinheiro">{reais(fidelidade.premio * fidelidade.disponiveis)}</span> pra usar!
              </h2>
            ) : (
              <h2 className="mt-1 font-gotica text-[34px] font-semibold leading-tight">
                {fidelidade.no_cartao === 0 && fidelidade.contadas === 0
                  ? 'Seu cartão está esperando o primeiro carimbo.'
                  : `Faltam ${fidelidade.necessarias - fidelidade.no_cartao} ${fidelidade.necessarias - fidelidade.no_cartao === 1 ? 'sessão' : 'sessões'}.`}
              </h2>
            )}
            <p className="mt-3 text-[15px] leading-relaxed text-osso-2">
              A cada {fidelidade.necessarias} sessões, {reais(fidelidade.premio)} em tatuagem. O estúdio carimba na hora da sessão.
              {fidelidade.contadas > 0 && ` Você já fez ${fidelidade.contadas} ${fidelidade.contadas === 1 ? 'sessão' : 'sessões'} com a gente.`}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Bloco kicker={`quem você trouxe · ${indicados.length}`} titulo={indicados.length ? `${indicados.length} ${indicados.length === 1 ? 'amigo' : 'amigos'} no Fosco` : 'Ninguém ainda'}>
          {indicados.length === 0 ? (
            <p className="text-[15px] text-osso-2">Quando alguém se cadastrar pelo seu link, aparece aqui.</p>
          ) : (
            <>
              {tatuaram > 0 && <p className="mb-3 text-[14px] text-osso-3">{tatuaram} já tatuaram com a gente.</p>}
              <ul className="max-h-80 divide-y divide-osso/[0.07] overflow-y-auto pr-1">
                {indicados.map((i, k) => (
                  <li key={k} className="flex items-center justify-between gap-3 py-2.5 text-[15px]">
                    <span className="text-osso">{i.nome}</span>
                    <span className="flex items-center gap-2 font-mono text-[11px] text-osso-3">
                      {i.tatuou && <span className="rounded-full bg-ambar/15 px-2 py-0.5 text-ambar-claro">tatuou</span>}
                      {haQuanto(i.criado_em)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Bloco>

        <Bloco kicker="extrato de pontos" titulo="Entradas e saídas">
          {extrato.length === 0 ? (
            <p className="text-[15px] text-osso-2">Nada por aqui ainda.</p>
          ) : (
            <ul className="max-h-80 divide-y divide-osso/[0.07] overflow-y-auto pr-1">
              {extrato.map((e, k) => (
                <li key={k} className="flex items-center justify-between gap-3 py-2.5 text-[15px]">
                  <span>
                    <span className="text-osso">{MOTIVOS[e.motivo] || e.motivo}</span>
                    <span className="block text-[12.5px] text-osso-3">
                      {e.indicado ? `${e.indicado} · ` : ''}
                      {e.observacao ? `${e.observacao} · ` : ''}
                      {dataCurta(e.criado_em)}
                    </span>
                  </span>
                  <span className={`font-mono text-[14px] font-semibold ${e.pontos > 0 ? 'text-[#9fc98a]' : 'text-[#f0a596]'}`}>
                    {e.pontos > 0 ? '+' : ''}
                    {e.pontos}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Bloco>
      </div>

      {sessoes.length > 0 && (
        <Bloco kicker="suas sessões" titulo="Histórico" className="mt-6">
          <ul className="divide-y divide-osso/[0.07]">
            {sessoes.map((s, k) => (
              <li key={k} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-[15px]">
                <span className="text-osso">
                  {dataCurta(s.data)}
                  {s.artista ? ` · com ${s.artista}` : ''}
                  {s.descricao ? <span className="text-osso-3"> · {s.descricao}</span> : null}
                </span>
                <span className="flex gap-2 font-mono text-[11px]">
                  {Number(s.desconto_percentual) > 0 && <span className="rounded-full bg-ambar/15 px-2 py-0.5 text-ambar-claro">-{numero(s.desconto_percentual)}%</span>}
                  {Number(s.premio_valor) > 0 && <span className="rounded-full bg-selo/20 px-2 py-0.5 text-[#f4b3a6]">prêmio {reais(s.premio_valor)}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Bloco>
      )}

      <Bloco kicker="seus dados" titulo="Contato e senha" className="mt-6">
        <MeusDados cliente={cliente} aoSalvar={carregar} />
      </Bloco>

      <div className="mt-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
        <a href={linkOrcamento(estudio)} target="_blank" rel="noopener noreferrer" className="botao">
          Pedir orçamento no WhatsApp
        </a>
        <Link href="/" className="botao-linha">
          Voltar pro site
        </Link>
      </div>
    </div>
  );
}
