'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Marca from '../Marca';
import { Aviso, Campo, CampoSenha } from '../Formulario';
import { IconeAjustes, IconeBalao, IconeCasa, IconeMoldura, IconePessoas, IconeSair, IconeEmail } from '../Icones';
import { AvisosProvider, Carregando } from './ui';
import { PainelCtx } from './contexto';
import Inicio from './Inicio';
import Clientes from './Clientes';
import Orcamentos from './Orcamentos';
import Mensagens from './Mensagens';
import Vitrine from './Vitrine';
import Ajustes from './Ajustes';
import { supa, erroLegivel } from '@/lib/supabase';
import { ESTUDIO_PADRAO, PROGRAMA_PADRAO } from '@/lib/config';

const ABAS = [
  { id: 'inicio', rotulo: 'Início', icone: IconeCasa, Comp: Inicio },
  { id: 'clientes', rotulo: 'Clientes', icone: IconePessoas, Comp: Clientes },
  { id: 'orcamentos', rotulo: 'Orçamentos', icone: IconeBalao, Comp: Orcamentos },
  { id: 'mensagens', rotulo: 'Mensagens', icone: IconeEmail, Comp: Mensagens },
  { id: 'vitrine', rotulo: 'Vitrine', icone: IconeMoldura, Comp: Vitrine },
  { id: 'ajustes', rotulo: 'Ajustes', icone: IconeAjustes, Comp: Ajustes },
];

function Entrada({ aoEntrar }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [indo, setIndo] = useState(false);
  async function entrar(e) {
    e.preventDefault();
    setErro('');
    setIndo(true);
    const { error } = await supa().auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
    setIndo(false);
    if (error) return setErro(/Invalid login/i.test(error.message) ? 'E-mail ou senha não conferem.' : erroLegivel(error));
    aoEntrar();
  }
  return (
    <main className="parede parede-topo flex min-h-[100svh] items-center justify-center px-4 py-10">
      <form onSubmit={entrar} className="cartao w-full max-w-sm space-y-5 p-7">
        <div className="text-center">
          <Marca className="mx-auto h-20 w-auto text-osso" titulo="" />
          <h1 className="titulo mt-4 text-[44px]">Painel</h1>
          <p className="text-[14px] text-osso-3">Só para a equipe do estúdio.</p>
        </div>
        <Campo rotulo="E-mail" id="p-email">
          <input id="p-email" type="email" className="campo" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </Campo>
        <Campo rotulo="Senha" id="p-senha">
          <CampoSenha id="p-senha" valor={senha} aoMudar={setSenha} placeholder="sua senha" />
        </Campo>
        {erro && <Aviso>{erro}</Aviso>}
        <button type="submit" className="botao w-full" disabled={indo}>
          {indo ? 'Entrando...' : 'Entrar'}
        </button>
        <Link href="/" className="block text-center text-[13px] text-osso-3 hover:text-osso">
          voltar pro site
        </Link>
      </form>
    </main>
  );
}

export default function Painel() {
  const [estado, setEstado] = useState('verificando');
  const [usuario, setUsuario] = useState(null);
  const [aba, setAba] = useState('inicio');
  const [config, setConfig] = useState({ estudio: ESTUDIO_PADRAO, programa: PROGRAMA_PADRAO });
  const [artistas, setArtistas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [clientes, setClientes] = useState(null);
  const [foco, setFoco] = useState(null); // cliente aberto vindo de outra aba

  const recarregarBase = useCallback(async () => {
    const db = supa();
    const [c, a, m] = await Promise.all([
      db.from('fosco_config').select('estudio, programa').eq('id', 1).maybeSingle(),
      db.from('fosco_artistas').select('*').order('ordem').order('criado_em'),
      db.from('fosco_modelos').select('*').order('ordem').order('criado_em'),
    ]);
    if (c.data) setConfig({ estudio: { ...ESTUDIO_PADRAO, ...c.data.estudio }, programa: { ...PROGRAMA_PADRAO, ...c.data.programa } });
    if (a.data) setArtistas(a.data);
    if (m.data) setModelos(m.data);
  }, []);

  const recarregarClientes = useCallback(async () => {
    const { data, error } = await supa().rpc('fosco_admin_clientes');
    if (!error) setClientes(data || []);
  }, []);

  const verificar = useCallback(async () => {
    const db = supa();
    const { data: s } = await db.auth.getSession();
    const u = s?.session?.user;
    if (!u) return setEstado('fora');
    const { data: linha } = await db.from('fosco_admins').select('user_id, nome').eq('user_id', u.id).maybeSingle();
    if (!linha) return setEstado('sem-acesso');
    setUsuario({ ...u, nome: linha.nome });
    setEstado('dentro');
    recarregarBase();
    recarregarClientes();
  }, [recarregarBase, recarregarClientes]);

  useEffect(() => {
    verificar();
    const h = window.location.hash.replace('#', '');
    if (ABAS.some((a) => a.id === h)) setAba(h);
  }, [verificar]);

  function irPara(id, extra) {
    setAba(id);
    if (extra) setFoco(extra);
    history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0 });
  }

  async function sair() {
    await supa().auth.signOut();
    setUsuario(null);
    setEstado('fora');
  }

  if (estado === 'verificando') return <main className="min-h-[100svh] bg-noite"><Carregando texto="abrindo o painel..." /></main>;
  if (estado === 'fora') return <Entrada aoEntrar={verificar} />;
  if (estado === 'sem-acesso')
    return (
      <main className="flex min-h-[100svh] flex-col items-center justify-center gap-5 bg-noite px-4 text-center">
        <Aviso>Essa conta não tem acesso ao painel do estúdio.</Aviso>
        <button type="button" className="botao-linha" onClick={sair}>
          Sair e entrar com outra conta
        </button>
      </main>
    );

  const Atual = ABAS.find((a) => a.id === aba)?.Comp ?? Inicio;
  const ctx = { usuario, config, setConfig, artistas, setArtistas, modelos, setModelos, clientes, recarregarBase, recarregarClientes, irPara, foco, setFoco };

  return (
    <AvisosProvider>
      <PainelCtx.Provider value={ctx}>
        <div className="min-h-[100svh] bg-noite lg:pl-60">
          {/* menu lateral no computador */}
          <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-osso/10 bg-carvao px-4 py-6 lg:flex">
            <Link href="/" className="flex items-center gap-2.5 px-2 text-osso">
              <Marca className="h-10 w-auto" titulo="" />
              <span className="leading-none">
                <span className="block font-gotica text-[26px] font-bold">Fosco</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-osso-3">painel</span>
              </span>
            </Link>
            <nav className="mt-8 flex-1 space-y-1">
              {ABAS.map(({ id, rotulo, icone: Icone }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => irPara(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] transition ${
                    aba === id ? 'bg-ambar/15 text-ambar-claro' : 'text-osso-2 hover:bg-osso/[0.05] hover:text-osso'
                  }`}
                >
                  <Icone /> {rotulo}
                </button>
              ))}
            </nav>
            <div className="border-t border-osso/10 pt-4 text-[13px] text-osso-3">
              <div className="truncate px-2">{usuario.nome || usuario.email}</div>
              <button type="button" onClick={sair} className="mt-2 flex items-center gap-2 rounded-lg px-2 py-1.5 hover:text-osso">
                <IconeSair width={16} height={16} /> Sair
              </button>
            </div>
          </aside>

          {/* topo no celular */}
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-osso/10 bg-noite/90 px-4 py-3 backdrop-blur lg:hidden">
            <span className="flex items-center gap-2">
              <Marca className="h-8 w-auto text-osso" titulo="" />
              <span className="font-gotica text-[22px] font-bold">{ABAS.find((a) => a.id === aba)?.rotulo}</span>
            </span>
            <button type="button" onClick={sair} className="botao-mini">
              <IconeSair width={15} height={15} /> Sair
            </button>
          </header>

          <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pt-10">
            <Atual />
          </main>

          {/* abas embaixo no celular */}
          <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-osso/10 bg-carvao/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
            {ABAS.map(({ id, rotulo, icone: Icone }) => (
              <button
                key={id}
                type="button"
                onClick={() => irPara(id)}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] ${aba === id ? 'text-ambar-claro' : 'text-osso-3'}`}
              >
                <Icone width={21} height={21} />
                {rotulo}
              </button>
            ))}
          </nav>
        </div>
      </PainelCtx.Provider>
    </AvisosProvider>
  );
}
