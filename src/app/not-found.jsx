import Link from 'next/link';
import Marca from '@/components/Marca';

// o quadro que caiu do prego
export default function NaoAchou() {
  return (
    <main className="parede parede-topo flex min-h-[100svh] flex-col items-center justify-center px-4 text-center">
      <div className="relative h-[240px] w-[220px]">
        {/* o prego, sozinho, e o barbante arrebentado */}
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full" style={{ background: 'radial-gradient(circle at 35% 35%,#d6c09a,#6b5537 70%)' }} />
        <svg viewBox="0 0 220 60" className="absolute left-0 top-1 w-full" aria-hidden="true">
          <path d="M110 4 q-18 24 -46 30" fill="none" stroke="rgba(201,178,140,.6)" strokeWidth="1.2" />
        </svg>
        <div className="quadro absolute bottom-0 left-2 w-[170px]" style={{ transform: 'rotate(-24deg)', transformOrigin: '0 100%' }}>
          <div className="quadro-passe flex aspect-[3/4] items-center justify-center !bg-[#2a1d14]">
            <Marca className="h-24 w-auto text-osso/80" titulo="" />
          </div>
        </div>
      </div>
      <h1 className="titulo mt-10 text-[64px]">Página sumiu</h1>
      <p className="mt-3 text-[17px] text-osso-2">Esse quadro caiu da parede. O endereço não existe mais, ou nunca existiu.</p>
      <Link href="/" className="botao mt-8">
        Voltar pro início
      </Link>
    </main>
  );
}
