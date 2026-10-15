'use client';
import { useEffect, useState } from 'react';
import { Campo, CampoSenha } from '../Formulario';
import { IconeLixo } from '../Icones';
import { Carregando, Interruptor, Secao, useAvisar } from './ui';
import { usePainel } from './contexto';
import { funcao, supa, erroLegivel } from '@/lib/supabase';
import { limparCacheVitrine } from '@/lib/vitrine';
import { numero, reais, regraIndicacao } from '@/lib/formatos';

const CAMPOS_ESTUDIO = [
  ['nome', 'Nome do estúdio'],
  ['nome_curto', 'Nome curto (o grandão da página)'],
  ['cidade', 'Cidade'],
  ['chamada', 'Frase de abertura'],
  ['endereco', 'Endereço (aparece no rodapé e na /bio)'],
  ['mapa', 'Link do mapa (Google Maps)'],
  ['horario', 'Horário'],
  ['whatsapp', 'WhatsApp do estúdio (DDD + número)'],
  ['instagram', 'Instagram (sem @)'],
  ['grupo_whatsapp', 'Link do grupo/comunidade do WhatsApp'],
  ['chave_pix', 'Chave Pix (vai na resposta do orçamento)'],
];

function Estudio() {
  const { config, setConfig } = usePainel();
  const avisar = useAvisar();
  const [f, setF] = useState(config.estudio);
  useEffect(() => setF(config.estudio), [config.estudio]);
  async function salvar(e) {
    e.preventDefault();
    const estudio = { ...f, whatsapp: String(f.whatsapp || '').replace(/\D/g, ''), instagram: String(f.instagram || '').replace(/^@/, '').trim() };
    const { error } = await supa().from('fosco_config').update({ estudio, atualizado_em: new Date().toISOString() }).eq('id', 1);
    if (error) return avisar(erroLegivel(error), 'erro');
    setConfig((c) => ({ ...c, estudio }));
    limparCacheVitrine();
    avisar('Dados do estúdio salvos');
  }
  return (
    <form onSubmit={salvar} className="grid gap-4 sm:grid-cols-2">
      {CAMPOS_ESTUDIO.map(([k, r]) => (
        <Campo key={k} rotulo={r} id={`e-${k}`} className={k === 'chamada' || k === 'mapa' ? 'sm:col-span-2' : ''}>
          <input id={`e-${k}`} className="campo" value={f[k] ?? ''} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
        </Campo>
      ))}
      <div className="sm:col-span-2">
        <button type="submit" className="botao">
          Salvar dados do estúdio
        </button>
      </div>
    </form>
  );
}

function Programa() {
  const { config, setConfig } = usePainel();
  const avisar = useAvisar();
  const [p, setP] = useState(config.programa);
  useEffect(() => setP(config.programa), [config.programa]);
  const n = (k) => Number(p[k]) || 0;
  const regra = regraIndicacao(p);
  const amigosMax = regra.amigos(regra.max);

  async function salvar(e) {
    e.preventDefault();
    const programa = { ...p };
    for (const k of ['pontos_primeira_indicacao', 'pontos_por_indicacao', 'pontos_boas_vindas', 'pontos_boas_vindas_indicado', 'pontos_indicado_tatuou', 'percentual_por_ponto', 'desconto_maximo', 'fidelidade_sessoes', 'fidelidade_premio', 'sinal_percentual']) {
      programa[k] = Math.max(0, Number(String(p[k]).replace(',', '.')) || 0);
    }
    programa.desconto_maximo = Math.min(100, programa.desconto_maximo);
    programa.fidelidade_sessoes = Math.max(1, Math.round(programa.fidelidade_sessoes));
    const { error } = await supa().from('fosco_config').update({ programa, atualizado_em: new Date().toISOString() }).eq('id', 1);
    if (error) return avisar(erroLegivel(error), 'erro');
    setConfig((c) => ({ ...c, programa }));
    limparCacheVitrine();
    avisar('Regras salvas');
  }

  const num = (k, r, dica) => (
    <Campo rotulo={r} id={`p-${k}`} dica={dica}>
      <input id={`p-${k}`} className="campo" inputMode="decimal" value={p[k] ?? ''} onChange={(e) => setP({ ...p, [k]: e.target.value.replace(/[^\d.,]/g, '') })} />
    </Campo>
  );

  return (
    <form onSubmit={salvar} className="space-y-8">
      <div className="space-y-4">
        <Interruptor ligado={p.indicacao_ativa !== false} aoMudar={(v) => setP({ ...p, indicacao_ativa: v })} rotulo="Indique e ganhe ligado" />
        <div className="grid gap-4 sm:grid-cols-3">
          {num('pontos_primeira_indicacao', 'Pontos da 1ª indicação', 'Quem indica ganha no 1º amigo que se cadastra pelo link (10 = 10%). É o que o site anuncia.')}
          {num('pontos_por_indicacao', 'Pontos por amigo depois do 1º', 'Cada amigo a partir do 2º (1 = 1%).')}
          {num('percentual_por_ponto', '% de desconto por ponto')}
          {num('desconto_maximo', 'Desconto máximo (%)')}
          {num('pontos_boas_vindas_indicado', 'Pontos de quem chega pelo convite', 'O amigo indicado ganha ao se cadastrar pelo link (1 = 1%). Regra interna: não aparece no site.')}
          {num('pontos_boas_vindas', 'Pontos de boas-vindas pra todos', 'Qualquer cadastro, com ou sem convite (0 = nada).')}
          {num('pontos_indicado_tatuou', 'Bônus quando o indicado tatua', 'Extra pra quem indicou na 1ª sessão do amigo (0 = nada).')}
        </div>
        <p className="rounded-xl bg-ambar/10 p-3 text-[14px] text-ambar-claro">
          Com essas regras: a 1ª indicação vale {numero(regra.primeira)}%, cada amigo depois vale {numero(regra.depois)}% e com {amigosMax} amigos a pessoa chega em {numero(regra.max)}%.
        </p>
      </div>
      <div className="space-y-4">
        <Interruptor ligado={p.fidelidade_ativa !== false} aoMudar={(v) => setP({ ...p, fidelidade_ativa: v })} rotulo="Cartão fidelidade ligado" />
        <div className="grid gap-4 sm:grid-cols-3">
          {num('fidelidade_sessoes', 'Sessões pra completar')}
          {num('fidelidade_premio', 'Prêmio (R$)')}
          {num('sinal_percentual', 'Sinal do orçamento (%)')}
        </div>
        <p className="text-[13.5px] text-osso-3">
          A cada {n('fidelidade_sessoes') || 1} sessões, {reais(n('fidelidade_premio'))} em tatuagem. Mudar as regras vale na hora pra todo mundo, inclusive pra quem já tem pontos.
        </p>
      </div>
      <button type="submit" className="botao">
        Salvar regras
      </button>
    </form>
  );
}

function Acessos() {
  const avisar = useAvisar();
  const [equipe, setEquipe] = useState(null);
  const [f, setF] = useState({ nome: '', email: '', senha: '' });
  async function carregar() {
    const { dados, erro } = await funcao('fosco-admin', { acao: 'listar_equipe' });
    if (erro) return avisar(erro, 'erro');
    setEquipe(dados.equipe);
  }
  useEffect(() => {
    carregar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function adicionar(e) {
    e.preventDefault();
    if (f.senha && f.senha.length < 8) return avisar('A senha precisa de pelo menos 8 caracteres.', 'erro');
    const { dados, erro } = await funcao('fosco-admin', { acao: 'adicionar_equipe', ...f });
    if (erro) return avisar(erro, 'erro');
    avisar(dados.criou ? 'Acesso criado: passe o e-mail e a senha pra pessoa' : 'Essa conta já existia: o acesso ao painel foi liberado com a senha que ela já usa');
    setF({ nome: '', email: '', senha: '' });
    carregar();
  }
  async function remover(u) {
    if (!confirm(`Tirar o acesso de ${u.nome || u.email} ao painel?`)) return;
    const { erro } = await funcao('fosco-admin', { acao: 'remover_equipe', user_id: u.user_id });
    if (erro) return avisar(erro, 'erro');
    carregar();
  }
  if (!equipe) return <Carregando />;
  return (
    <div className="space-y-5">
      <ul className="divide-y divide-osso/[0.07] rounded-2xl border border-osso/10 bg-carvao/70">
        {equipe.map((u) => (
          <li key={u.user_id} className="flex items-center justify-between gap-3 px-4 py-3">
            <span>
              <span className="block text-[15px] text-osso">
                {u.nome || '—'} {u.eu && <span className="font-mono text-[11px] text-ambar">(você)</span>}
              </span>
              <span className="font-mono text-[12px] text-osso-3">{u.email}</span>
            </span>
            {!u.eu && (
              <button type="button" className="botao-perigo" onClick={() => remover(u)} aria-label="Tirar acesso">
                <IconeLixo width={15} height={15} />
              </button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={adicionar} className="grid gap-3 sm:grid-cols-3">
        <Campo rotulo="Nome" id="q-nome">
          <input id="q-nome" className="campo" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} required />
        </Campo>
        <Campo rotulo="E-mail" id="q-email">
          <input id="q-email" type="email" className="campo" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
        </Campo>
        <Campo rotulo="Senha (mín. 8)" id="q-senha">
          <input id="q-senha" className="campo" value={f.senha} onChange={(e) => setF({ ...f, senha: e.target.value })} required minLength={8} />
        </Campo>
        <div className="sm:col-span-3">
          <button type="submit" className="botao-mini">
            Dar acesso ao painel
          </button>
        </div>
      </form>
    </div>
  );
}

function MinhaSenha() {
  const avisar = useAvisar();
  const [s, setS] = useState('');
  async function trocar(e) {
    e.preventDefault();
    if (s.length < 8) return avisar('Use pelo menos 8 caracteres.', 'erro');
    const { error } = await supa().auth.updateUser({ password: s });
    if (error) return avisar(erroLegivel(error), 'erro');
    setS('');
    avisar('Senha trocada');
  }
  return (
    <form onSubmit={trocar} className="flex flex-wrap items-end gap-3">
      <Campo rotulo="Senha nova" id="ms" className="min-w-[14rem] flex-1">
        <CampoSenha id="ms" valor={s} aoMudar={setS} autoComplete="new-password" placeholder="mínimo 8 caracteres" />
      </Campo>
      <button type="submit" className="botao-mini mb-1.5">
        Trocar
      </button>
    </form>
  );
}

export default function Ajustes() {
  return (
    <div className="space-y-12">
      <div>
        <p className="kicker">regras e dados</p>
        <h1 className="titulo mt-1 text-[48px]">Ajustes</h1>
      </div>
      <Secao titulo="Regras do programa">
        <Programa />
      </Secao>
      <Secao titulo="Dados do estúdio">
        <Estudio />
      </Secao>
      <Secao titulo="Quem entra no painel">
        <Acessos />
      </Secao>
      <Secao titulo="Minha senha">
        <MinhaSenha />
      </Secao>
    </div>
  );
}
