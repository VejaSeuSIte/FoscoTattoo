'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Revelar from '../Revelar';
import Marca from '../Marca';
import CartaoFidelidade from '../CartaoFidelidade';
import { IconeSeta } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { numero, reais } from '@/lib/formatos';

// quando entra na tela, liga (para animar os carimbos)
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

// pedaço de fita crepe segurando o cartaz
function Fita({ className = '', giro = -6 }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-8 w-28 ${className}`}
      style={{
        transform: `rotate(${giro}deg)`,
        background: 'rgba(214, 196, 150, 0.72)',
        clipPath: 'polygon(3% 8%, 0 30%, 4% 52%, 0 74%, 3% 96%, 97% 92%, 100% 70%, 96% 48%, 100% 26%, 97% 4%)',
        boxShadow: '0 1px 2px rgba(0,0,0,.25)',
      }}
    />
  );
}

export function Indique() {
  const { programa } = useVitrine();
  if (programa.indicacao_ativa === false) return null;

  const porAmigo = Number(programa.pontos_por_indicacao) * Number(programa.percentual_por_ponto) || 1;
  const max = Number(programa.desconto_maximo) || 50;
  // as tirinhas de destacar do cartaz: quantos amigos, quanto de desconto
  const passos = [0.1, 0.2, 0.4, 0.6, 0.8, 1].map((f) => Math.max(porAmigo, Math.round((max * f) / porAmigo) * porAmigo));
  const tiras = [...new Set(passos)].map((pct) => ({ pct, amigos: Math.ceil(pct / porAmigo) }));

  return (
    <section id="indique" className="parede relative scroll-mt-16 overflow-hidden py-20 sm:py-28" style={{ '--luz-x': '30%', '--luz-y': '30%', '--luz-abre': '90%' }}>
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        {/* o cartaz colado na parede */}
        <Revelar className="relative mx-auto w-full max-w-[520px]">
          <div className="relative" style={{ transform: 'rotate(-1.6deg)', filter: 'drop-shadow(0 22px 26px rgba(0,0,0,.7))' }}>
          <div className="papel relative rounded-t-[4px] px-6 pb-8 pt-10 sm:px-10" style={{ boxShadow: 'inset 0 0 40px rgba(120,80,40,.28)' }}>
            <Fita className="-top-3 left-6" giro={-8} />
            <Fita className="-top-3 right-6" giro={7} />
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#6b5640]">o boca a boca do fosco agora vale desconto</p>
            <h2 className="mt-3 font-gotica text-[clamp(66px,12vw,104px)] font-bold leading-[0.84] text-papel-tinta">
              Indique
              <br />e <span className="text-selo-escuro">ganhe</span>
            </h2>
            <div className="mt-6 flex items-center gap-5">
              <div
                className="flex h-[104px] w-[104px] shrink-0 rotate-[-10deg] flex-col items-center justify-center rounded-full border-[3px] border-double border-selo-escuro text-center leading-none text-selo-escuro"
                aria-hidden="true"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.18em]">1 amigo</span>
                <span className="font-gotica text-[44px] font-bold">{numero(porAmigo)}%</span>
              </div>
              <p className="text-[16px] leading-relaxed text-[#3e2f24]">
                Cada amigo que se cadastrar pelo <b>seu link</b> vira {numero(porAmigo)}% de desconto na sua próxima tattoo. Dá pra juntar até <b>{max}%</b>.
              </p>
            </div>
          </div>
            {/* tirinhas de destacar, uma já arrancada */}
            <div className="flex">
              {tiras.map((t, i) => {
                const arrancada = i === 2;
                return (
                  <div
                    key={t.pct}
                    className={`relative h-[118px] flex-1 ${arrancada ? '' : 'border-t-2 border-dashed border-[#7a6248]/55'} ${i < tiras.length - 1 && !arrancada ? 'border-r-2' : ''} ${i === tiras.length - 1 ? 'rounded-br-[4px]' : ''} ${i === 0 ? 'rounded-bl-[4px]' : ''}`}
                    style={arrancada ? undefined : { backgroundColor: '#e8dabd', backgroundImage: 'var(--grao-escuro)', borderRightStyle: 'dashed', borderRightColor: 'rgba(122,98,72,.45)' }}
                  >
                    {arrancada ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-3 bg-[#e8dabd]"
                        style={{ clipPath: 'polygon(0 0,100% 0,100% 40%,85% 100%,70% 45%,55% 90%,40% 35%,25% 85%,10% 40%,0 70%)' }}
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="rotate-180 whitespace-nowrap font-mono text-[12px] font-medium text-papel-tinta [writing-mode:vertical-rl]">
                          {t.amigos} {t.amigos === 1 ? 'amigo' : 'amigos'} · <b className="text-selo-escuro">{numero(t.pct)}%</b>
                        </span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Revelar>

        {/* o como, em três frases */}
        <Revelar atraso={120}>
          <ul className="space-y-6">
            {[
              ['Faz seu cadastro', 'Nome, CPF, WhatsApp e aniversário. O seu link sai na hora.'],
              ['Manda o link', 'No WhatsApp, no direct do Instagram, no grupo da família. Pra quem você quiser.'],
              ['Acompanha na sua área', 'Cada cadastro pelo seu link entra lá. Na sessão, é só avisar que quer usar o desconto.'],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-4">
                <Marca className="mt-1 h-12 w-auto shrink-0 text-ambar" titulo="" />
                <div>
                  <div className="font-gotica text-[30px] font-semibold leading-none text-osso">{t}</div>
                  <p className="mt-1.5 text-[16px] leading-relaxed text-osso-2">{d}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/cadastro/" className="botao">
              Quero meu link <IconeSeta width={17} height={17} />
            </Link>
            <Link href="/entrar/" className="botao-linha">
              Já tenho cadastro
            </Link>
          </div>
          <p className="mt-6 max-w-md text-[13.5px] leading-relaxed text-osso-3">
            O desconto vale numa sessão, até {max}%. O que passar disso fica guardado pra próxima.
          </p>
        </Revelar>
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
    <section id="fidelidade" className="relative scroll-mt-16 overflow-hidden bg-carvao py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <div ref={ref} className="order-2 lg:order-1">
          <CartaoFidelidade total={n} carimbos={viu ? Math.min(n - 1, Math.ceil(n * 0.66)) : 0} premio={premio} animar />
        </div>
        <Revelar className="order-1 lg:order-2">
          <h2 className="titulo text-[clamp(46px,7.5vw,82px)]">
            A cada {n} sessões, <span className="brasa dinheiro">{reais(premio)}</span> em tattoo.
          </h2>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-osso-2">
            Toda sessão no Fosco ganha um carimbo no seu cartão. Fechou {n}, os {reais(premio)} são seus pra usar na próxima. O cartão fica na sua área do site, sem papel pra perder.
          </p>
          <Link href="/entrar/" className="botao mt-8">
            Ver meu cartão <IconeSeta width={17} height={17} />
          </Link>
        </Revelar>
      </div>
    </section>
  );
}
