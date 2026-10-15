'use client';
import Link from 'next/link';
import Revelar from '../Revelar';
import { CAMINHOS_MARCA } from '../Marca';
import { GravuraFundo, Marcado } from '../Emprestimos';
import { IconeGota, IconeSeta, IconeZap } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { numero, reais } from '@/lib/formatos';

// a folha de decalque roxa (o stencil que passa o desenho pra pele), com o «f» traçado
function Decalque({ className = '' }) {
  return (
    <div className={`relative ${className}`} style={{ transform: 'rotate(3deg)' }}>
      <span
        aria-hidden="true"
        className="absolute -top-3 left-1/2 z-10 h-7 w-24 -translate-x-1/2 -rotate-3"
        style={{ background: 'rgba(214,196,150,.75)', clipPath: 'polygon(3% 8%,0 30%,4% 52%,0 74%,3% 96%,97% 92%,100% 70%,96% 48%,100% 26%,97% 4%)' }}
      />
      <svg viewBox="0 0 300 380" className="block w-full rounded-[3px] shadow-[0_26px_40px_-18px_rgba(0,0,0,.9)]" role="img" aria-label="Folha de decalque com o f do Fosco traçado em roxo">
        <defs>
          <pattern id="decalque-papel" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r=".6" fill="#b9add6" />
          </pattern>
        </defs>
        <rect width="300" height="380" fill="#f1eef8" />
        <rect width="300" height="380" fill="url(#decalque-papel)" opacity=".5" />
        <g fill="none" stroke="#5b3fa8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="150" cy="190" r="128" strokeWidth="1" strokeDasharray="4 6" opacity=".55" />
          <path d="M40 350 H260 M40 344 v12 M260 344 v12" strokeWidth="1.2" opacity=".7" />
          <g transform="translate(108 30) scale(0.86)" strokeWidth="2.2">
            <circle cx="59" cy="25" r="16.5" />
            {CAMINHOS_MARCA.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <path d="M70 120 q-14 30 6 60 M232 230 q16 -24 -2 -56" strokeWidth="1" opacity=".5" />
          <path d="M60 300 l22 -14 M66 312 l26 -16 M72 324 l22 -14" strokeWidth=".9" opacity=".45" />
        </g>
        <text x="150" y="372" textAnchor="middle" fill="#5b3fa8" fontFamily="var(--fonte-mono)" fontSize="11" opacity=".8">
          10 cm
        </text>
      </svg>
    </div>
  );
}

export function ChamadaOrcamento() {
  return (
    <section className="relative overflow-hidden bg-noite py-24 sm:py-32">
      <GravuraFundo nome="lobo" className="-left-[8%] bottom-[-6%] w-[52%] sm:w-[38%]" opacidade={0.06} />
      <div className="relative mx-auto grid max-w-5xl items-center gap-14 px-4 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <Revelar>
          <h2 className="titulo text-[clamp(56px,10vw,112px)]">
            Tem uma <Marcado gesto="sublinhado_ondulado" cor="ambar">ideia</Marcado>?
          </h2>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-osso-2">
            Conta onde vai ser, o tamanho e manda uma referência. A gente responde pelo WhatsApp com o valor e, quando fechar, ela vira desenho na folha de decalque.
          </p>
          <Link href="/orcamento/" className="botao mt-9 px-8 py-4 text-[16px]">
            Pedir orçamento <IconeSeta width={18} height={18} />
          </Link>
        </Revelar>
        <Revelar atraso={150} className="mx-auto w-full max-w-[300px]">
          <Decalque />
        </Revelar>
      </div>
    </section>
  );
}

// faixa de papel chamando para a página de cuidados
export function ChamadaCuidados() {
  return (
    <section className="relative overflow-hidden bg-noite px-4 py-16 sm:px-6">
      <GravuraFundo nome="libelula3" className="-right-[6%] top-[8%] w-[46%] rotate-[-8deg] sm:w-[30%]" opacidade={0.08} />
      <Revelar className="relative mx-auto max-w-4xl">
        <Link
          href="/cuidados/"
          className="papel group flex flex-col items-start gap-5 rounded-xl px-6 py-6 transition-transform duration-300 hover:-rotate-0 sm:flex-row sm:items-center sm:px-9"
          style={{ transform: 'rotate(-0.8deg)' }}
        >
          <span className="flex h-16 w-16 shrink-0 -rotate-6 items-center justify-center rounded-full bg-selo text-[#fbeee0] transition-transform group-hover:rotate-0">
            <IconeGota width={30} height={30} />
          </span>
          <span className="flex-1">
            <span className="block font-gotica text-[34px] font-bold leading-none text-papel-tinta">Tattoo nova?</span>
            <span className="mt-1.5 block text-[15.5px] leading-relaxed text-[#4a3a2c]">
              O passo a passo do Fosco pra cicatrizar bonito: o que fazer e o que evitar nos primeiros dias.
            </span>
          </span>
          <span className="botao-tinta shrink-0">
            Ver os cuidados <IconeSeta width={16} height={16} />
          </span>
        </Link>
      </Revelar>
    </section>
  );
}

// as perguntas de sempre, como verbetes (o glossário do UmRabiscoPsi, com a palavra emoldurada)
export function Dicionario() {
  const { programa } = useVitrine();
  const porAmigo = Number(programa.pontos_por_indicacao) * Number(programa.percentual_por_ponto) || 1;
  const verbetes = [
    ['Orçamento', 'Você conta a ideia aqui no site, com foto de referência, e a gente responde no WhatsApp com o valor.', '/orcamento/'],
    ['Sinal', `Uma parte do valor (${numero(programa.sinal_percentual || 30)}%) no Pix pra garantir o seu horário.`],
    ['Sessão', 'O tempo na cadeira. Tattoo grande, como fechamento, pode precisar de mais de uma.'],
    ['Película', 'O protetor que a gente aplica no fim da sessão. Pode ficar até 3 dias.', '/cuidados/'],
    ['Fidelidade', `Um carimbo por sessão. Com ${programa.fidelidade_sessoes || 6}, você ganha ${reais(programa.fidelidade_premio || 200)} em tattoo.`, '/entrar/'],
    ['Indicação', `Cada amigo que se cadastra pelo seu link vale ${numero(porAmigo)}% de desconto, até ${programa.desconto_maximo || 50}%.`, '/cadastro/'],
  ];
  return (
    <section className="relative overflow-hidden bg-carvao py-20 sm:py-28">
      <GravuraFundo nome="borboleta" className="-right-[10%] -top-[8%] w-[58%] rotate-12 sm:w-[40%]" opacidade={0.05} />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Revelar className="max-w-2xl">
          <h2 className="titulo text-[clamp(46px,7.5vw,80px)]">Pequeno dicionário do Fosco</h2>
          <p className="mt-4 text-[17px] text-osso-2">As palavras que mais aparecem na conversa com a gente.</p>
        </Revelar>
        <dl className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {verbetes.map(([palavra, definicao, href], i) => (
            <Revelar key={palavra} atraso={(i % 3) * 90}>
              <dt>
                <span
                  className="inline-block border-[1.5px] border-dashed border-ambar/70 px-4 py-1.5 font-gotica text-[32px] font-bold leading-none text-osso"
                  style={{ transform: `rotate(${i % 2 ? 1.6 : -1.8}deg)` }}
                >
                  {palavra}
                </span>
              </dt>
              <dd className="mt-4 text-[16px] leading-relaxed text-osso-2">
                {definicao}
                {href && (
                  <Link href={href} className="ml-1 whitespace-nowrap font-semibold text-ambar-claro hover:text-osso">
                    ver →
                  </Link>
                )}
              </dd>
            </Revelar>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Comunidade() {
  const { estudio } = useVitrine();
  if (!estudio.grupo_whatsapp) return null;
  return (
    <section className="parede parede-topo relative py-16" style={{ '--luz-abre': '60%' }}>
      <Revelar className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center sm:flex-row sm:text-left">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#1f7a4d] text-white">
          <IconeZap width={32} height={32} />
        </div>
        <div className="flex-1">
          <h2 className="font-gotica text-[34px] font-bold leading-tight">Entra no grupo do Fosco</h2>
          <p className="mt-1 text-[15px] text-osso-2">Vaga que abre de última hora, flash do dia e novidade do estúdio caem lá primeiro.</p>
        </div>
        <a href={estudio.grupo_whatsapp} target="_blank" rel="noopener noreferrer" className="botao">
          Entrar no grupo
        </a>
      </Revelar>
    </section>
  );
}
