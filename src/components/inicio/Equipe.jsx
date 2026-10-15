'use client';
import Quadro from '../Quadro';
import Revelar from '../Revelar';
import Prateleira from '../Prateleira';
import { Marcado, SombraBambu } from '../Emprestimos';
import { useVitrine } from '@/lib/vitrine';
import { BASE } from '@/lib/config';

const GIROS = [-2.5, 1.8, -1, 2.6, 1.2, -2.2, 2, -1.6, 1.4, -2.8];
// parede de galeria: as colunas não ficam na mesma altura
const DESCE = ['', 'lg:mt-14', 'lg:mt-4', 'lg:mt-20', 'sm:mt-8 lg:mt-0', 'lg:mt-12', 'sm:mt-8 lg:mt-2', 'lg:mt-16'];

// a gravura japonesa da parede, como o quadro do dragão dos retratos
function QuadroDragao() {
  return (
    <figure className="grupo-quadro relative mx-auto w-full max-w-[300px] pt-10">
      <div className="quadro quadro-prego" style={{ transform: 'rotate(2.2deg)', '--giro': '2.2deg' }}>
        <div className="quadro-passe p-3">
          <img src={`${BASE}/acervo/dragao.webp`} alt="Gravura japonesa antiga de um dragão sobre um sábio" loading="lazy" className="block w-full" />
        </div>
      </div>
      <figcaption className="placa mx-auto mt-5 w-fit rounded-[3px] px-3 py-1 text-center font-mono text-[9.5px] uppercase tracking-[0.2em]">
        Yashima Gakutei · séc. XIX
      </figcaption>
    </figure>
  );
}

export default function Equipe() {
  const { artistas } = useVitrine();
  if (artistas && artistas.length === 0) return null;
  const lista = artistas ?? Array.from({ length: 8 }, (_, i) => ({ id: i, foto: `equipe/0${i + 1}.webp`, nome: '', funcao: '' }));
  return (
    <section id="equipe" className="parede parede-topo relative scroll-mt-16 overflow-hidden pt-20 sm:pt-28" style={{ '--luz-abre': '95%' }}>
      <SombraBambu className="-right-[8%] top-[6%] hidden h-[70%] -scale-x-100 skew-x-6 lg:block" opacidade={0.3} />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-8 md:grid-cols-[1.3fr_1fr]">
          <Revelar>
            <h2 className="titulo text-[clamp(48px,8vw,84px)]">
              Quem tatua <Marcado gesto="circulo" cor="ambar">aqui</Marcado>
            </h2>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-osso-2">
              Cada artista com o seu traço. No pedido de orçamento você escolhe com quem quer fazer, ou deixa que a gente indica.
            </p>
          </Revelar>
          <Revelar atraso={150}>
            <QuadroDragao />
          </Revelar>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-10">
          {lista.map((a, i) => (
            <Revelar key={a.id} atraso={(i % 4) * 90} className={DESCE[i % DESCE.length]}>
              <Quadro artista={a} giro={GIROS[i % GIROS.length]} />
            </Revelar>
          ))}
        </div>
      </div>
      <Prateleira variante={1} className="mt-10 px-2" />
    </section>
  );
}
