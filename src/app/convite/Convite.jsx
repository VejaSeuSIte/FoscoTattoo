'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logotipo } from '@/components/Marca';
import Rodape from '@/components/Rodape';
import { Fundo } from '@/components/inicio/Abertura';
import { CarrosselEquipe, useListaEquipe } from '@/components/inicio/Equipe';
import { IconeAgulha, IconeCheck, IconeInsta, IconeLapis, IconePresente, IconeSeta } from '@/components/Icones';
import Passos from '@/components/Passos';
import { FormularioCadastro } from '../cadastro/FormCadastro';
import { supa, minhaArea } from '@/lib/supabase';
import { useVitrine, guardarIndicacao, lerIndicacao } from '@/lib/vitrine';
import { instagramUrl, nomeBonito, numero, regraIndicacao, urlFoto } from '@/lib/formatos';

// A página para onde vai o link de indicação: a chamada para indicar na abertura, os
// trabalhos, a equipe, como funciona e o cadastro. Tudo leva para o mesmo botão.
// O ponto que o amigo ganha ao chegar pelo convite é regra interna e não aparece aqui.
export default function Convite() {
  const router = useRouter();
  const { programa, estudio, instagram } = useVitrine();
  const equipe = useListaEquipe();
  const [codigo, setCodigo] = useState('');
  const [quem, setQuem] = useState('');
  const [jaCliente, setJaCliente] = useState(false);
  const [barra, setBarra] = useState(false);
  const abertura = useRef(null);
  const cadastro = useRef(null);

  const { primeira, depois, max } = regraIndicacao(programa);
  const fotos = (instagram || []).slice(0, 12);

  useEffect(() => {
    const c = (new URLSearchParams(window.location.search).get('i') || lerIndicacao() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!c) {
      router.replace('/cadastro/');
      return;
    }
    setCodigo(c);
    guardarIndicacao(c);
    supa()
      .rpc('fosco_quem_indicou', { p_codigo: c })
      .then(({ data, error }) => {
        if (!error && !data) router.replace('/cadastro/');
        else if (data) setQuem(nomeBonito(data));
      });
    minhaArea().then((d) => d?.cliente && setJaCliente(true));
  }, [router]);

  // no celular, um botão fixo embaixo depois da abertura, até chegar no cadastro
  useEffect(() => {
    const vistos = { abertura: true, cadastro: false };
    const olho = new IntersectionObserver((itens) => {
      for (const e of itens) vistos[e.target === abertura.current ? 'abertura' : 'cadastro'] = e.isIntersecting;
      setBarra(!vistos.abertura && !vistos.cadastro);
    });
    if (abertura.current) olho.observe(abertura.current);
    if (cadastro.current) olho.observe(cadastro.current);
    return () => olho.disconnect();
  }, []);

  const pct = `${numero(primeira)}%`;
  const mais = `${numero(depois)}%`;

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Fosco Tattoo Studio, página inicial" className="text-osso">
            <Logotipo compacto className="h-[50px] w-auto" titulo="" />
          </Link>
          <Link href="/entrar/" className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-osso-2 hover:text-ambar-claro">
            Já tenho cadastro
          </Link>
        </div>
      </header>

      <main className="bg-noite">
        {/* abertura: a chamada para indicar */}
        <section ref={abertura} className="relative isolate flex min-h-[92svh] flex-col overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-[56%] overflow-hidden md:inset-0 md:h-full">
            <Fundo />
            <div className="abertura-veu absolute inset-0" aria-hidden="true" />
          </div>
          <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-14 pt-[110px] sm:px-6 md:justify-center md:pb-20">
            <div className="abertura-texto max-w-[34rem]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-ambar-claro">
                {quem ? `${quem} te indicou o Fosco` : 'Você foi indicado ao Fosco'}
              </p>
              <h1 className="mt-4 leading-none text-osso">
                <span className="titulo block text-[clamp(22px,3.4vw,32px)]">
                  Faça sua 1ª indicação
                  <br />e ganhe
                </span>
                <span className="mt-2 block font-gotica text-[clamp(96px,22vw,180px)] font-bold leading-[0.8]">{pct}</span>
                <span className="titulo mt-3 block text-[clamp(22px,3.4vw,32px)]">de desconto na sua tattoo</span>
              </h1>
              <p className="mt-5 max-w-[28rem] text-[17px] leading-relaxed text-osso-2">
                Faz o cadastro em um minuto e seu link sai na hora. A 1ª indicação vale {pct} e cada amigo a mais soma {mais}, até {max}%.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <a href="#cadastro" className="botao">
                  Quero meu link <IconeSeta width={17} height={17} />
                </a>
                <a href="#trabalhos" className="text-[14.5px] font-semibold text-osso-2 underline decoration-osso/30 underline-offset-[6px] hover:text-ambar-claro hover:decoration-ambar">
                  Ver os trabalhos
                </a>
              </div>
            </div>
          </div>
          <div className="led" />
        </section>

        {/* os trabalhos */}
        {fotos.length > 0 && (
          <section id="trabalhos" className="scroll-mt-6 py-20 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="titulo text-[clamp(28px,4.2vw,42px)]">Trabalhos do estúdio</h2>
                  <span className="linha-ambar" />
                </div>
                <a href={instagramUrl(estudio.instagram || 'foscotattoo')} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[14px] font-semibold text-ambar-claro hover:text-osso">
                  <IconeInsta width={17} height={17} /> Ver mais no Instagram
                </a>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-1.5 overflow-hidden rounded-2xl sm:gap-2 lg:grid-cols-6">
                {fotos.map((p, i) => (
                  <a
                    key={p.shortcode}
                    href={`https://www.instagram.com/${p.video ? 'reel' : 'p'}/${p.shortcode}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group block aspect-square overflow-hidden bg-fuligem ${i >= 9 ? 'hidden lg:block' : ''}`}
                    aria-label={p.legenda ? `Trabalho de ${p.legenda} no Instagram` : 'Trabalho no Instagram do Fosco'}
                  >
                    <img src={urlFoto(p.imagem)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]" />
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* a equipe */}
        {equipe.length > 0 && (
          <section className="border-t border-osso/10 py-20 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <h2 className="titulo text-[clamp(28px,4.2vw,42px)]">{equipe.length} artistas, estilos diferentes</h2>
              <span className="linha-ambar" />
              <p className="subtitulo max-w-xl">Do traço fino ao blackwork, do oriental ao colorido: na conversa do orçamento a gente indica quem combina com a sua ideia.</p>
              <div className="mt-10">
                <CarrosselEquipe artistas={equipe} />
              </div>
            </div>
          </section>
        )}

        {/* como funciona */}
        <section className="border-t border-osso/10 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="titulo text-[clamp(28px,4.2vw,42px)]">Como funciona</h2>
            <span className="linha-ambar" />
            <Passos
              className="mt-10 md:hidden"
              itens={[
                { Icone: IconeLapis, titulo: 'Cadastre-se', texto: 'Um minuto, com CPF e WhatsApp. O link sai na hora.' },
                { Icone: IconePresente, titulo: 'Indique', texto: `${pct} na 1ª indicação e +${mais} a cada amigo, até ${max}%.` },
                { Icone: IconeAgulha, titulo: 'Tatue', texto: 'Conta sua ideia no WhatsApp e avisa na sessão.' },
              ]}
            />
            <ol className="mt-10 hidden gap-8 md:grid md:grid-cols-3">
              {[
                ['Faz o cadastro', 'Um minuto, com CPF e WhatsApp. Seu link de indicação sai na hora.'],
                ['Manda pros amigos', `A 1ª indicação vale ${pct} de desconto pra você, e cada amigo depois soma mais ${mais}, até ${max}%.`],
                ['Tatua com desconto', 'Conta sua ideia no WhatsApp e, na sessão, é só avisar. O estúdio confere pelo seu CPF.'],
              ].map(([t, d], i) => (
                <li key={t} className="border-t border-osso/15 pt-5">
                  <span className="font-gotica text-[44px] font-bold leading-none text-ambar">{i + 1}</span>
                  <h3 className="mt-3 text-[17px] font-bold uppercase tracking-[0.06em] text-osso">{t}</h3>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-osso-2">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* o cadastro */}
        <section id="cadastro" ref={cadastro} className="parede scroll-mt-6 border-t border-osso/10 py-20 sm:py-24" style={{ '--luz-x': '25%', '--luz-y': '30%', '--luz-abre': '95%' }}>
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div className="lg:pt-6">
              <h2 className="titulo text-[clamp(30px,5vw,48px)]">
                Sua 1ª indicação já vale <span className="text-ambar">{pct}</span>
              </h2>
              <span className="linha-ambar" />
              <ul className="mt-8 grid grid-cols-2 gap-2.5 lg:grid-cols-1 lg:gap-3.5">
                {[
                  'Não custa nada',
                  'Seu link de indicação sai na hora',
                  `+${mais} a cada amigo depois, até ${max}%`,
                  'Sem spam: só os avisos do programa',
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 rounded-xl border border-osso/10 bg-noite/60 px-3 py-3 text-[14px] leading-snug text-osso sm:text-[15px] lg:gap-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:text-[16px]">
                    <IconeCheck width={18} height={18} className="mt-0.5 shrink-0 text-ambar" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            {jaCliente ? (
              <div className="cartao p-8 text-center">
                <h3 className="titulo text-[28px]">Você já tem cadastro</h3>
                <p className="mt-3 text-[16px] text-osso-2">O convite vale pra quem ainda não se cadastrou. Seu desconto e seu link estão na sua área.</p>
                <Link href="/minha-area/" className="botao mt-6">
                  Ir pra minha área <IconeSeta width={18} height={18} />
                </Link>
              </div>
            ) : (
              <FormularioCadastro codigo={codigo} quem={quem} />
            )}
          </div>
        </section>

        {/* dúvidas */}
        <section className="border-t border-osso/10 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="titulo text-[clamp(26px,4vw,38px)]">Dúvidas</h2>
            <span className="linha-ambar" />
            <div className="mt-8 divide-y divide-osso/10 border-y border-osso/10">
              {[
                ['Tem algum custo?', 'Não. O cadastro é de graça.'],
                ['Quando o desconto entra?', `Assim que o amigo se cadastra pelo seu link: ${pct} na 1ª indicação e ${mais} em cada uma depois, até ${max}% no total. Você acompanha tudo na sua área do site.`],
                ['Como eu uso o desconto?', 'Na conversa do orçamento pelo WhatsApp, avise que tem desconto. Na sessão o estúdio confere no seu CPF.'],
              ].map(([q, r]) => (
                <details key={q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16.5px] font-semibold text-osso">
                    {q}
                    <span className="text-[22px] leading-none text-ambar transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[15.5px] leading-relaxed text-osso-2">{r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Rodape />

      <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-osso/10 bg-noite/95 p-3 transition duration-300 md:hidden ${barra ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`}>
        <a href="#cadastro" className="botao w-full py-3.5">
          Quero meu link <IconeSeta width={17} height={17} />
        </a>
      </div>
    </>
  );
}
