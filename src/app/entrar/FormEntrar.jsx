'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Aviso, Campo, CampoSenha } from '@/components/Formulario';
import { Logotipo } from '@/components/Marca';
import CartaoFidelidade from '@/components/CartaoFidelidade';
import { IconeInsta, IconeZap } from '@/components/Icones';
import { supa, erroLegivel } from '@/lib/supabase';
import { useVitrine } from '@/lib/vitrine';
import { cpfValido, instagramUrl, linkZap, mascaraCpf, soDigitos } from '@/lib/formatos';

export default function FormEntrar() {
  const router = useRouter();
  const { estudio } = useVitrine();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [esqueci, setEsqueci] = useState(false);
  const [entrando, setEntrando] = useState(false);
  const [novo, setNovo] = useState(false);

  useEffect(() => {
    setNovo(new URLSearchParams(window.location.search).has('novo'));
    supa()
      .auth.getSession()
      .then(({ data }) => data?.session?.user?.email?.endsWith('@fosco.cliente') && router.replace('/minha-area/'));
  }, [router]);

  async function entrar(e) {
    e.preventDefault();
    setErro('');
    if (!cpfValido(cpf)) return setErro('Confira o CPF.');
    if (senha.length < 6) return setErro('A senha tem pelo menos 6 caracteres.');
    setEntrando(true);
    const { error } = await supa().auth.signInWithPassword({ email: `${soDigitos(cpf)}@fosco.cliente`, password: senha });
    if (error) {
      setEntrando(false);
      return setErro(erroLegivel(error));
    }
    router.push('/minha-area/');
  }

  const textoAjuda = `Oi! Esqueci minha senha do site do Fosco. Meu CPF é ${mascaraCpf(cpf) || '...'}`;

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6">
      <div className="text-center">
        <Logotipo compacto className="mx-auto h-[104px] w-auto text-osso" />
        <h1 className="titulo mt-6 text-[clamp(34px,8vw,48px)]">Minha área</h1>
        <p className="mt-2 text-[16px] text-osso-2">Seus pontos, seu link e seu cartão fidelidade.</p>
      </div>
      {novo && (
        <div className="mt-6">
          <Aviso tipo="ok">Cadastro feito! Entre com seu CPF e a senha que você criou.</Aviso>
        </div>
      )}
      <div className="relative mt-8">
      {/* o cartão fidelidade aparece atrás do formulário: é por ele que a pessoa entra */}
      <div className="pointer-events-none absolute -right-20 top-12 hidden w-[340px] rotate-[8deg] opacity-90 sm:block lg:-right-52">
        <CartaoFidelidade total={6} carimbos={3} premio={200} giro={0} />
      </div>
      <form onSubmit={entrar} className="cartao relative space-y-5 bg-carvao p-6 sm:p-8" noValidate>
        <Campo rotulo="CPF" id="cpf">
          <input id="cpf" className="campo font-mono" inputMode="numeric" autoComplete="username" value={cpf} onChange={(e) => setCpf(mascaraCpf(e.target.value))} placeholder="000.000.000-00" />
        </Campo>
        <Campo rotulo="Senha" id="senha">
          <CampoSenha id="senha" valor={senha} aoMudar={setSenha} placeholder="sua senha" />
        </Campo>
        {erro && <Aviso>{erro}</Aviso>}
        <button type="submit" className="botao w-full py-4" disabled={entrando}>
          {entrando ? 'Entrando...' : 'Entrar'}
        </button>
        <button type="button" onClick={() => setEsqueci((v) => !v)} className="w-full text-center text-[14px] text-osso-3 underline underline-offset-4 hover:text-osso">
          Esqueci minha senha
        </button>
        {esqueci && (
          <div className="rounded-xl border border-osso/10 bg-noite/60 p-4 text-[14.5px] leading-relaxed text-osso-2">
            Fala com a gente que o estúdio gera uma senha nova pra você na hora.
            <div className="mt-3 flex flex-wrap gap-2">
              {estudio.whatsapp && (
                <a href={linkZap(estudio.whatsapp, textoAjuda)} target="_blank" rel="noopener noreferrer" className="botao-mini">
                  <IconeZap width={16} height={16} /> WhatsApp
                </a>
              )}
              {estudio.instagram && (
                <a href={`https://ig.me/m/${estudio.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="botao-mini">
                  <IconeInsta width={16} height={16} /> Direct
                </a>
              )}
            </div>
          </div>
        )}
      </form>
      </div>
      <p className="mt-6 text-center text-[15px] text-osso-2">
        Ainda não tem cadastro?{' '}
        <Link href="/cadastro/" className="font-semibold text-ambar-claro underline underline-offset-4">
          Criar agora
        </Link>
      </p>
    </div>
  );
}
