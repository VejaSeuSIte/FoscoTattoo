'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Revelar from '../Revelar';
import Regua from '../Regua';
import CartaoFidelidade from '../CartaoFidelidade';
import { IconeSeta } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { numero, reais } from '@/lib/formatos';

// quando entra na tela, liga (para animar a régua e os carimbos)
function useAoVer() {
  const ref = useRef(null);
  const [viu, setViu] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return setViu(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setViu(true), io.disconnect()), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, viu];
}

export function Indique() {
  const { programa } = useVitrine();
  const [ref, viu] = useAoVer();
  if (programa.indicacao_ativa === false) return null;

  const porAmigo = Number(programa.pontos_por_indicacao) * Number(programa.percentual_por_ponto) || 1;
  const max = Number(programa.desconto_maximo) || 50;
  const amigosPraMax = Math.ceil(max / porAmigo);
  const marcos = [Math.round(max / 5), Math.round(max / 2), max].filter((v, i, a) => v > 0 && a.indexOf(v) === i);
  const amigos = (pct) => Math.ceil(pct / porAmigo);

  const passos = [
    ['Cadastre-se', 'Leva um minuto: nome, CPF, WhatsApp e aniversário. Na hora você ganha o seu link.'],
    ['Mande o link', 'No WhatsApp, no direct do Instagram, no grupo da família. Pra quantas pessoas quiser.'],
    ['Junte o desconto', `Cada pessoa que se cadastra pelo seu link vale ${numero(porAmigo)}%. Dá pra juntar até ${max}% e usar na sua próxima tattoo.`],
  ];

  return (
    <section id="indique" className="relative scroll-mt-16 overflow-hidden bg-carvao py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: 'radial-gradient(60% 50% at 85% 20%, rgba(212,145,74,.14), transparent 70%)' }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
        <Revelar>
          <p className="kicker">Nº 04 · indique e ganhe</p>
          <h2 className="titulo mt-3 text-[clamp(48px,8vw,88px)]">
            Cada amigo vale <span className="brasa">{numero(porAmigo)}%</span>.
          </h2>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-osso-2">
            O Fosco sempre cresceu no boca a boca. Agora ele vira desconto pra você: com {amigosPraMax} amigos cadastrados pelo seu link, sua próxima tattoo sai com {max}% de desconto.
          </p>
          <ol className="mt-8 space-y-5">
            {passos.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ambar/50 font-mono text-[13px] text-ambar-claro">
                  {i + 1}
                </span>
                <div>
                  <div className="font-gotica text-[24px] font-semibold leading-tight text-osso">{t}</div>
                  <p className="mt-1 text-[15px] leading-relaxed text-osso-2">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/cadastro/" className="botao">
              Quero meu link <IconeSeta width={18} height={18} />
            </Link>
            <Link href="/entrar/" className="botao-linha">
              Já tenho cadastro
            </Link>
          </div>
        </Revelar>

        <div ref={ref} className="cartao relative p-6 sm:p-9">
          <div className="flex items-baseline justify-between gap-4">
            <span className="kicker">sua régua de desconto</span>
            <span className="font-mono text-[11px] text-osso-3">exemplo</span>
          </div>
          <div className="mt-2 font-gotica text-[64px] font-bold leading-none text-osso sm:text-[80px]">
            {viu ? Math.round(max / 2) : 0}
            <span className="text-ambar">%</span>
          </div>
          <p className="text-[14px] text-osso-3">com {amigos(max / 2)} amigos cadastrados pelo seu link</p>
          <Regua valor={viu ? max / 2 : 0} maximo={max} marcos={marcos} legenda={(m) => `${amigos(m)} amigos`} className="mt-6" />
          <p className="mt-4 border-t border-osso/10 pt-4 text-[13px] leading-relaxed text-osso-3">
            O desconto vale numa sessão, até {max}%. Usou, a régua volta a zero e você continua indicando. O que passar de {max}% fica guardado pra próxima.
          </p>
        </div>
      </div>
    </section>
  );
}

export function Fidelidade() {
  const { programa } = useVitrine();
  const [ref, viu] = useAoVer();
  if (programa.fidelidade_ativa === false) return null;
  const n = Number(programa.fidelidade_sessoes) || 6;
  const premio = Number(programa.fidelidade_premio) || 200;
  return (
    <section id="fidelidade" className="parede parede-direita relative scroll-mt-16 overflow-hidden py-20 sm:py-28" style={{ '--luz-x': '22%', '--luz-y': '60%' }}>
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <div ref={ref} className="order-2 lg:order-1">
          <CartaoFidelidade total={n} carimbos={viu ? Math.min(n - 1, Math.ceil(n * 0.66)) : 0} premio={premio} animar />
        </div>
        <Revelar className="order-1 lg:order-2">
          <p className="kicker">Nº 05 · cartão fidelidade</p>
          <h2 className="titulo mt-3 text-[clamp(46px,7.5vw,82px)]">
            A cada {n} sessões, <span className="brasa dinheiro">{reais(premio)}</span> em tattoo.
          </h2>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-osso-2">
            Toda sessão no Fosco ganha um carimbo no seu cartão. Fechou {n}, os {reais(premio)} são seus pra usar na próxima. O cartão fica na sua área do site, sem papel pra perder.
          </p>
          <Link href="/entrar/" className="botao mt-8">
            Ver meu cartão <IconeSeta width={18} height={18} />
          </Link>
        </Revelar>
      </div>
    </section>
  );
}
