import Marca from './Marca';
import Selo from './Selo';
import { reais } from '@/lib/formatos';

const GIROS = [-9, 6, -4, 11, -12, 3, 8, -6, 5, -10, 7, -3];

// o cartão de papel com os carimbos das sessões
export default function CartaoFidelidade({ total = 6, carimbos = 0, premio = 200, animar = false, giro = -1.2, className = '' }) {
  const n = Math.max(1, Math.min(12, Number(total) || 6));
  return (
    <div className={`papel picote relative rounded-xl px-5 py-5 pl-8 sm:px-6 sm:pl-9 ${className}`} style={{ transform: `rotate(${giro}deg)` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Marca className="h-10 w-auto shrink-0 text-papel-tinta" titulo="" />
          <div className="leading-none">
            <div className="font-gotica text-[24px] font-bold sm:text-[26px]">Cartão Fosco</div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.26em] text-[#6b5640]">uma marca por sessão</div>
          </div>
        </div>
        <div className="shrink-0 rounded border border-[#6b5640]/50 px-2 py-1 text-right font-mono text-[10px] uppercase leading-tight tracking-wider text-[#6b5640]">
          {n} sessões
          <br />
          <b className="dinheiro text-[14px] text-selo-escuro">{reais(premio)}</b>
        </div>
      </div>
      <div className={`mt-5 grid gap-2.5 sm:gap-3 ${n > 6 ? 'grid-cols-4 sm:grid-cols-6' : 'grid-cols-3 sm:grid-cols-6'}`}>
        {Array.from({ length: n }, (_, i) => {
          const cheio = i < carimbos;
          const ultimo = i === n - 1;
          return (
            <div key={i} className="relative flex aspect-square items-center justify-center rounded-full border-[1.5px] border-dashed border-[#7a6248]/60">
              {cheio ? (
                <Selo tamanho="112%" giro={GIROS[i % GIROS.length]} entrar={animar} atraso={i * 140} className="absolute" />
              ) : (
                <span className={`font-mono text-[11px] ${ultimo ? 'font-semibold text-selo-escuro' : 'text-[#7a6248]/80'}`}>
                  {ultimo ? reais(premio) : String(i + 1).padStart(2, '0')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
