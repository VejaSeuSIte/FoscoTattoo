'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Revelar from '../Revelar';
import Marca from '../Marca';
import CartaoFidelidade from '../CartaoFidelidade';
import { IconeSeta } from '../Icones';
import { GravuraFundo, Marcado } from '../Emprestimos';
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
  const presente = Number(programa.pontos_boas_vindas_indicado ?? 10) * (Number(programa.percentual_por_ponto) || 1);
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
                Cada amigo que se cadastrar pelo <b>seu link</b> vira {numero(porAmigo)}% de desconto na sua próxima tattoo, até <b>{max}%</b>.{presente > 0 && <> E ele já entra com <b>{numero(presente)}%</b>.</>}
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

        {/* a promessa e o como, em três frases */}
        <Revelar atraso={120}>
          <h2 className="titulo text-[clamp(30px,4.4vw,46px)]">
            {presente > 0 ? (
              <>
                Seu amigo ganha {numero(presente)}%. <span className="text-ambar">Você junta até {max}%.</span>
              </>
            ) : (
              <>
                Até <span className="text-ambar">{max}%</span> de desconto na sua próxima tattoo
              </>
            )}
          </h2>
          <span className="linha-ambar" />
          <ul className="mt-9 space-y-6">
            {[
              ['Faz seu cadastro', 'Leva um minuto. O seu link sai na hora.'],
              ['Manda pros amigos', presente > 0 ? `Quem se cadastrar pelo seu link já ganha ${numero(presente)}% na primeira tattoo.` : 'No WhatsApp, no direct do Instagram, no grupo da família.'],
              ['Ganha você também', `Cada amigo cadastrado vale ${numero(porAmigo)}% pra você, até ${max}%. Na sessão, é só avisar.`],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="w-9 shrink-0 font-corpo text-[22px] font-extrabold leading-none text-ambar">0{i + 1}</span>
                <div>
                  <div className="font-corpo text-[17px] font-extrabold uppercase tracking-[0.06em] text-osso">{t}</div>
                  <p className="mt-1.5 text-[15.5px] leading-relaxed text-osso-2">{d}</p>
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

// o carimbo de borracha e a almofada de tinta, em cima do balcão
function Carimbo({ className = '' }) {
  return (
    <svg viewBox="0 0 180 120" className={className} aria-hidden="true">
      <ellipse cx="128" cy="108" rx="44" ry="7" fill="#000" opacity=".45" />
      <rect x="88" y="78" width="80" height="26" rx="5" fill="#2b1d15" />
      <rect x="94" y="82" width="68" height="14" rx="3" fill="#8e2d20" />
      <rect x="94" y="82" width="68" height="4" rx="2" fill="#c4503c" opacity=".7" />
      <g transform="rotate(-14 52 92)">
        <ellipse cx="52" cy="108" rx="30" ry="5" fill="#000" opacity=".4" />
        <rect x="26" y="88" width="52" height="16" rx="3" fill="#5a3820" />
        <rect x="26" y="100" width="52" height="5" rx="1.5" fill="#b5402e" />
        <rect x="44" y="52" width="16" height="38" rx="6" fill="#7a4e2c" />
        <ellipse cx="52" cy="46" rx="16" ry="13" fill="#8a5a32" />
        <ellipse cx="47" cy="41" rx="6" ry="4" fill="#c9965c" opacity=".7" />
      </g>
    </svg>
  );
}

export function Fidelidade() {
  const { programa } = useVitrine();
  const [ref, viu] = useAoVer();
  if (programa.fidelidade_ativa === false) return null;
  const n = Number(programa.fidelidade_sessoes) || 6;
  const premio = Number(programa.fidelidade_premio) || 200;
  const carimbos = viu ? Math.min(n - 1, Math.ceil(n * 0.66)) : 0;
  return (
    <section
      id="fidelidade"
      className="relative scroll-mt-16 overflow-hidden bg-carvao bg-[linear-gradient(180deg,#2a1416_0_52%,#14100c_52%_100%)] py-20 sm:py-28 lg:bg-[linear-gradient(90deg,#2a1416_0_50%,#14100c_50%_100%)]"
    >
      <GravuraFundo nome="besouro2" className="-left-[6%] top-[6%] w-[48%] rotate-[18deg] lg:w-[34%]" opacidade={0.06} />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <div ref={ref} className="relative order-2 lg:order-1">
          <CartaoFidelidade total={n} carimbos={carimbos} premio={premio} animar numerador className="relative z-10" />
          {/* o balcão de madeira onde o cartão está apoiado */}
          <div className="relative -mx-4 -mt-6 h-12 rounded-[3px] sm:-mx-8" style={{ background: 'linear-gradient(180deg,#7a4e2c,#5a3820 30%,#2e1c10)', boxShadow: '0 18px 30px -12px rgba(0,0,0,.8)' }}>
            <div className="absolute inset-x-0 top-0 h-[2px] bg-[#b07a46] opacity-80" />
          </div>
          <Carimbo className="absolute -bottom-2 right-0 z-20 w-36 sm:-right-6 sm:w-44" />
        </div>
        <Revelar className="order-1 lg:order-2">
          <h2 className="titulo text-[clamp(46px,7.5vw,82px)]">
            {n} sessões, <Marcado gesto="sublinhado_ondulado" cor="ambar"><span className="dinheiro text-ambar">{reais(premio)}</span></Marcado> em tattoo.
          </h2>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-osso-2">
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
