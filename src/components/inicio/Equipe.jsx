'use client';
import Quadro from '../Quadro';
import Revelar from '../Revelar';
import { useVitrine } from '@/lib/vitrine';

const GIROS = [-2.5, 1.8, -1, 2.6, 1.2, -2.2, 2, -1.6, 1.4, -2.8];

export default function Equipe() {
  const { artistas } = useVitrine();
  if (artistas && artistas.length === 0) return null;
  const lista = artistas ?? Array.from({ length: 8 }, (_, i) => ({ id: i, foto: `equipe/0${i + 1}.webp`, nome: '', funcao: '' }));
  return (
    <section id="equipe" className="parede parede-topo relative scroll-mt-16 py-20 sm:py-28" style={{ '--luz-abre': '95%' }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Revelar className="mx-auto max-w-2xl text-center">
          <h2 className="titulo text-[clamp(48px,8vw,84px)]">Quem tatua aqui</h2>
          <p className="mt-4 text-[16px] leading-relaxed text-osso-2">
            Cada artista com o seu traço. No pedido de orçamento você escolhe com quem quer fazer, ou deixa que a gente indica.
          </p>
        </Revelar>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-10">
          {lista.map((a, i) => (
            <Revelar key={a.id} atraso={(i % 4) * 90}>
              <Quadro artista={a} giro={GIROS[i % GIROS.length]} />
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  );
}
