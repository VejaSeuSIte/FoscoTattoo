'use client';
import Revelar from '../Revelar';
import { IconeAgulha, IconeCartao, IconeCheck, IconePessoas, IconePino, IconePresente, IconeZap } from '../Icones';
import { useVitrine } from '@/lib/vitrine';
import { BASE } from '@/lib/config';
import { linkOrcamento } from '@/lib/formatos';

export default function Estudio() {
  const { estudio, programa, artistas } = useVitrine();
  const itens = [
    { Icone: IconeAgulha, titulo: 'Tattoo e piercing', texto: 'Os dois no mesmo lugar' },
    { Icone: IconePessoas, titulo: artistas?.length ? `${artistas.length} artistas` : 'A equipe', texto: 'Cada um com o seu estilo' },
    { Icone: IconePresente, titulo: `Até ${programa.desconto_maximo || 50}% off`, texto: 'Indicando amigos' },
    { Icone: IconeCartao, titulo: 'Fidelidade', texto: `${programa.fidelidade_sessoes || 6} sessões, R$ ${programa.fidelidade_premio || 200} em tattoo` },
  ];
  return (
    <section id="estudio" className="parede relative scroll-mt-16 overflow-hidden py-20 sm:py-28" style={{ '--luz-x': '25%', '--luz-y': '30%', '--luz-abre': '95%' }}>
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <Revelar className="grid grid-cols-[1.5fr_1fr] gap-3">
          <img src={`${BASE}/estudio/02.webp`} alt="O balcão com a marca do Fosco, os quadros na parede e a maca" loading="lazy" className="row-span-2 h-full w-full rounded-2xl border border-osso/10 object-cover" />
          <img src={`${BASE}/estudio/04.webp`} alt="A maca de tatuagem, com a almofada laranja e a luminária" loading="lazy" className="aspect-[4/5] w-full rounded-2xl border border-osso/10 object-cover" />
          <img src={`${BASE}/estudio/03.webp`} alt="Um artista tatuando no estúdio" loading="lazy" className="aspect-[4/5] w-full rounded-2xl border border-osso/10 object-cover" />
        </Revelar>
        <Revelar atraso={120}>
          <h2 className="titulo text-[clamp(30px,4.4vw,46px)]">O estúdio</h2>
          <span className="linha-ambar" />
          <p className="subtitulo max-w-lg">
            O Fosco é um estúdio de tatuagem e piercing no Recife, com uma equipe de artistas de estilos diferentes e o tempo e o cuidado que cada sessão pede.
          </p>
          <ul className="mt-7 grid grid-cols-2 gap-2.5 sm:gap-3 lg:hidden">
            {itens.map(({ Icone, titulo, texto }) => (
              <li key={titulo} className="rounded-2xl border border-osso/10 bg-noite/60 p-3.5 sm:p-4">
                <Icone width={22} height={22} className="text-ambar" />
                <div className="mt-2.5 font-corpo text-[14px] font-extrabold uppercase leading-tight tracking-[0.04em] text-osso sm:text-[15px]">{titulo}</div>
                <p className="mt-1 text-[13px] leading-snug text-osso-2 sm:text-[14px]">{texto}</p>
              </li>
            ))}
          </ul>
          <ul className="mt-7 hidden space-y-3 lg:block">
            {[
              'Tatuagem e piercing',
              'Artistas de estilos diferentes',
              `Indique e ganhe até ${programa.desconto_maximo || 50}% de desconto`,
              `Cartão fidelidade: a cada ${programa.fidelidade_sessoes || 6} sessões, R$ ${programa.fidelidade_premio || 200} em tattoo`,
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[15.5px] text-osso">
                <IconeCheck width={18} height={18} className="mt-0.5 shrink-0 text-ambar" /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-7 flex items-start gap-2.5 text-[15px] text-osso-2">
            <IconePino width={18} height={18} className="mt-0.5 shrink-0 text-ambar" /> {estudio.endereco}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {estudio.mapa && (
              <a href={estudio.mapa} target="_blank" rel="noopener noreferrer" className="botao-linha">
                <IconePino width={16} height={16} /> Como chegar
              </a>
            )}
            <a href={linkOrcamento(estudio)} target="_blank" rel="noopener noreferrer" className="botao-linha">
              <IconeZap width={16} height={16} /> Falar no WhatsApp
            </a>
          </div>
        </Revelar>
      </div>
    </section>
  );
}
