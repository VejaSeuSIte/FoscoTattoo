import Marca from './Marca';
import { numero } from '@/lib/formatos';

// a régua do desconto: de 0 até o máximo, com o punhal apontando onde a pessoa está
export default function Regua({ valor = 0, maximo = 50, marcos = [], legenda, className = '' }) {
  const max = Math.max(1, Number(maximo) || 50);
  const v = Math.max(0, Math.min(max, Number(valor) || 0));
  const pos = (x) => `${(x / max) * 100}%`;
  const passo = max <= 20 ? 1 : max <= 60 ? 5 : 10;
  const tracos = [];
  for (let x = 0; x <= max; x += passo) tracos.push(x);
  return (
    <div className={`relative select-none px-3 pt-[74px] ${className}`}>
      <div className="relative">
        <div className="absolute -top-[74px] -translate-x-1/2 transition-[left] duration-700" style={{ left: pos(v) }}>
          <div className="flex flex-col items-center">
            <span className="mb-1 rounded bg-ambar px-1.5 py-0.5 font-mono text-[11px] font-semibold text-noite shadow-brilho">{numero(v)}%</span>
            <Marca className="h-11 w-auto text-ambar drop-shadow-[0_0_8px_rgba(236,160,80,.6)]" titulo="" />
          </div>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full bg-noite ring-1 ring-osso/15">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
            style={{ width: pos(v), background: 'linear-gradient(90deg,#7a4419,#d4914a 70%,#f1c487)', boxShadow: '0 0 18px rgba(236,160,80,.6)' }}
          />
        </div>
        <div className="relative mt-1 h-3">
          {tracos.map((x) => (
            <span key={x} className={`absolute top-0 w-px -translate-x-1/2 bg-osso/30 ${x % (passo * 2) === 0 ? 'h-3' : 'h-1.5'}`} style={{ left: pos(x) }} />
          ))}
        </div>
        {marcos.length > 0 && (
          <div className="relative mt-1 h-10">
            {marcos.map((m) => (
              <span key={m} className={`absolute top-0 whitespace-nowrap font-mono text-[10.5px] text-osso-2 ${m / max > 0.85 ? '-translate-x-full text-right' : m / max < 0.15 ? 'text-left' : '-translate-x-1/2 text-center'}`} style={{ left: pos(m) }}>
                <b className="block text-[13px] text-osso">{m}%</b>
                {legenda ? legenda(m) : ''}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
