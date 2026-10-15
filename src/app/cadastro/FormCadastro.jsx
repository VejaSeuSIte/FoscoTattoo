'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Aviso, Campo, CampoSenha } from '@/components/Formulario';
import { IconeSeta } from '@/components/Icones';
import Regua from '@/components/Regua';
import { funcao, supa, minhaArea } from '@/lib/supabase';
import { useVitrine, lerIndicacao, esquecerIndicacao } from '@/lib/vitrine';
import { cpfValido, mascaraCpf, mascaraZap, numero, soDigitos } from '@/lib/formatos';

// o formulário em si, usado aqui e na página do convite
export function FormularioCadastro({ codigo = '', quem = '', presente = 0, className = '' }) {
  const router = useRouter();
  const [f, setF] = useState({ nome: '', cpf: '', whatsapp: '', nascimento: '', email: '', senha: '', aceita_promocoes: false, aceite: false });
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const mudar = (k, fmt) => (e) => setF((x) => ({ ...x, [k]: fmt ? fmt(e.target.value) : e.target.value }));
  const comPresente = Boolean(codigo && presente > 0);

  function validar() {
    const e = {};
    const nome = f.nome.trim().replace(/\s+/g, ' ');
    if (nome.length < 4 || !nome.includes(' ')) e.nome = 'Escreva nome e sobrenome.';
    if (!cpfValido(f.cpf)) e.cpf = 'Esse CPF não parece certo. Confira os números.';
    if (soDigitos(f.whatsapp).length < 10) e.whatsapp = 'Coloque o WhatsApp com DDD.';
    if (!f.nascimento) e.nascimento = 'Coloque sua data de nascimento.';
    if (f.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim())) e.email = 'Esse e-mail não parece certo.';
    if (f.senha.length < 6) e.senha = 'A senha precisa ter pelo menos 6 caracteres.';
    if (!f.aceite) e.aceite = 'Precisa aceitar pra gente guardar seus dados.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function enviar(ev) {
    ev.preventDefault();
    setErro('');
    if (!validar()) return;
    setEnviando(true);
    const { dados, erro: falha } = await funcao('fosco-cadastro', { ...f, codigo });
    if (falha) {
      setEnviando(false);
      if (dados?.campo) setErros({ [dados.campo]: falha });
      else setErro(falha);
      return;
    }
    const { error } = await supa().auth.signInWithPassword({ email: dados.login, password: f.senha });
    esquecerIndicacao();
    if (error) {
      setEnviando(false);
      router.push('/entrar/?novo=1');
      return;
    }
    router.push(`/minha-area/?novo=1${comPresente ? '&convite=1' : ''}`);
  }

  return (
    <form onSubmit={enviar} className={`cartao space-y-5 p-5 sm:p-8 ${className}`} noValidate>
      <div>
        <h2 className="font-corpo text-[22px] font-bold uppercase tracking-[0.04em] text-osso">
          {comPresente ? `Garanta seus ${numero(presente)}%` : 'Cadastro'}
        </h2>
        <p className="mt-2 text-[14px] text-osso-3">Leva um minuto. Você entra depois com CPF e senha.</p>
      </div>
      <Campo rotulo="Nome completo" id="nome" erro={erros.nome}>
        <input id="nome" className="campo" value={f.nome} onChange={mudar('nome')} autoComplete="name" maxLength={120} aria-invalid={erros.nome ? 'true' : undefined} />
      </Campo>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo rotulo="CPF" id="cpf" erro={erros.cpf} dica="Só pra cada pessoa ter um cadastro.">
          <input id="cpf" className="campo font-mono" inputMode="numeric" value={f.cpf} onChange={mudar('cpf', mascaraCpf)} placeholder="000.000.000-00" aria-invalid={erros.cpf ? 'true' : undefined} />
        </Campo>
        <Campo rotulo="WhatsApp" id="whatsapp" erro={erros.whatsapp}>
          <input id="whatsapp" className="campo" inputMode="tel" autoComplete="tel-national" value={f.whatsapp} onChange={mudar('whatsapp', mascaraZap)} placeholder="(81) 99999-9999" aria-invalid={erros.whatsapp ? 'true' : undefined} />
        </Campo>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo rotulo="Data de nascimento" id="nascimento" erro={erros.nascimento} dica="No seu aniversário tem mensagem nossa.">
          <input id="nascimento" type="date" className="campo" value={f.nascimento} onChange={mudar('nascimento')} max={new Date().toISOString().slice(0, 10)} aria-invalid={erros.nascimento ? 'true' : undefined} />
        </Campo>
        <Campo rotulo="E-mail (opcional)" id="email" erro={erros.email}>
          <input id="email" type="email" className="campo" value={f.email} onChange={mudar('email')} autoComplete="email" maxLength={160} aria-invalid={erros.email ? 'true' : undefined} />
        </Campo>
      </div>
      <Campo rotulo="Crie uma senha" id="senha" erro={erros.senha}>
        <CampoSenha id="senha" valor={f.senha} aoMudar={(v) => setF((x) => ({ ...x, senha: v }))} erro={erros.senha} autoComplete="new-password" />
      </Campo>

      <div className="space-y-3 border-t border-osso/10 pt-5">
        <label className="flex cursor-pointer items-start gap-3 text-[14.5px] leading-snug text-osso-2">
          <input type="checkbox" className="caixa mt-0.5" checked={f.aceita_promocoes} onChange={(e) => setF((x) => ({ ...x, aceita_promocoes: e.target.checked }))} />
          Quero receber vaga com desconto, aviso de aniversário e novidades do Fosco no WhatsApp.
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-[14.5px] leading-snug text-osso-2">
          <input type="checkbox" className="caixa mt-0.5" checked={f.aceite} onChange={(e) => setF((x) => ({ ...x, aceite: e.target.checked }))} aria-invalid={erros.aceite ? 'true' : undefined} />
          <span>
            Li e aceito a{' '}
            <Link href="/privacidade/" target="_blank" className="text-osso underline decoration-ambar/60 underline-offset-4">
              política de privacidade
            </Link>
            .
          </span>
        </label>
        {erros.aceite && <p className="text-[13px] text-[#f0a596]">{erros.aceite}</p>}
      </div>

      {codigo && quem && <p className="font-mono text-[12px] text-osso-3">convite de {quem} · código {codigo}</p>}
      {erro && <Aviso>{erro}</Aviso>}
      <button type="submit" className="botao w-full py-4 text-[16px]" disabled={enviando}>
        {enviando ? 'Criando seu cadastro...' : comPresente ? `Criar cadastro e garantir meus ${numero(presente)}%` : 'Criar cadastro e pegar meu link'}
      </button>
      <p className="text-center text-[14px] text-osso-3">
        Já tem cadastro?{' '}
        <Link href="/entrar/" className="text-osso underline underline-offset-4 hover:text-ambar-claro">
          Entrar
        </Link>
      </p>
    </form>
  );
}

// quem chega com convite vai para a página do convite; aqui fica o cadastro de quem
// quer o próprio link
export default function FormCadastro() {
  const router = useRouter();
  const { programa } = useVitrine();
  const [jaCliente, setJaCliente] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('i') || lerIndicacao();
    if (c) {
      router.replace(`/convite/?i=${encodeURIComponent(c)}`);
      return;
    }
    setPronto(true);
    minhaArea().then((data) => data?.cliente && setJaCliente(true));
  }, [router]);

  const porAmigo = Number(programa.pontos_por_indicacao) * Number(programa.percentual_por_ponto) || 1;
  const max = Number(programa.desconto_maximo) || 50;
  const presente = Number(programa.pontos_boas_vindas_indicado ?? 10) * (Number(programa.percentual_por_ponto) || 1);

  if (!pronto) return <div className="min-h-[60svh]" />;

  if (jaCliente) {
    return (
      <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
        <h1 className="titulo text-[clamp(34px,8vw,48px)]">Você já tem cadastro</h1>
        <p className="mt-4 text-[17px] text-osso-2">Seu link, seus pontos e seu cartão estão na sua área.</p>
        <Link href="/minha-area/" className="botao mt-8">
          Ir pra minha área <IconeSeta width={18} height={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
      <div className="lg:pt-6">
        <h1 className="titulo text-[clamp(34px,6vw,58px)]">
          Seu link, <span className="text-ambar">seu desconto</span>
        </h1>
        <span className="linha-ambar" />
        <p className="mt-6 max-w-md text-[17px] leading-relaxed text-osso-2">
          Cadastre-se e ganhe na hora um link só seu. Cada pessoa que se cadastrar por ele vale {numero(porAmigo)}% de desconto na sua próxima tattoo, até {max}%
          {presente > 0 && <>, e ela ainda entra com {numero(presente)}% de presente</>}.
        </p>
        <div className="cartao mt-10 hidden p-6 lg:block">
          <Regua valor={Math.round(max * 0.36)} maximo={max} marcos={[Math.round(max / 5), Math.round(max / 2), max]} legenda={(m) => `${Math.ceil(m / porAmigo)} amigos`} />
        </div>
        <ul className="mt-8 hidden space-y-2 text-[15px] text-osso-2 lg:block">
          <li>· Seu cartão fidelidade também fica na sua área.</li>
          <li>· A gente não manda spam: promoção só se você marcar que quer.</li>
        </ul>
      </div>
      <FormularioCadastro />
    </div>
  );
}
