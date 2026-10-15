// Peças emprestadas das outras identidades do Gabriel, já na cor e no traço do Fosco:
// o canetão do UmRabiscoPsi, a gravura quase apagada no fundo, a poeira na luz.
import { BASE } from '@/lib/config';

const ENVOLVE = ['circulo', 'circulo_duplo', 'xis'];

// palavra marcada à mão: círculo em volta ou traço embaixo (o gesto fica atrás da letra)
export function Marcado({ children, gesto = 'sublinhado_ondulado', cor = 'ambar', className = '' }) {
  const envolve = ENVOLVE.includes(gesto);
  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <img
        src={`${BASE}/gestos/${gesto}-${cor}.webp`}
        alt=""
        aria-hidden="true"
        className={`gesto pointer-events-none absolute max-w-none select-none ${
          envolve ? '-left-[16%] -top-[34%] h-[168%] w-[132%]' : '-bottom-[0.3em] -left-[3%] h-[0.5em] w-[106%]'
        }`}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

// gesto solto (seta, asterisco, check) para pôr ao lado de alguma coisa
export function Gesto({ nome = 'seta_curva', cor = 'ambar', className = '' }) {
  return <img src={`${BASE}/gestos/${nome}-${cor}.webp`} alt="" aria-hidden="true" className={`gesto pointer-events-none select-none ${className}`} />;
}

// gravura enorme, creme, quase apagada e cortada pela borda: tira o chapado do fundo escuro
export function GravuraFundo({ nome, className = '', opacidade = 0.07 }) {
  return (
    <img
      src={`${BASE}/gravuras/${nome}.webp`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`pointer-events-none absolute max-w-none select-none ${className}`}
      style={{ opacity: opacidade }}
    />
  );
}

// ciscos de poeira boiando no feixe de luz (posições fixas, para não pular na tela)
const CISCOS = [
  [12, 62, 2, 11, 0, 18, -90], [24, 48, 1.5, 9, 2.2, -10, -70], [36, 70, 2.5, 13, 4.1, 14, -110], [44, 40, 1.2, 8, 1.1, 8, -60],
  [52, 58, 2, 12, 5.4, -16, -95], [60, 76, 1.6, 10, 3.2, 20, -80], [68, 50, 2.2, 14, 0.6, -12, -120], [76, 66, 1.4, 9, 6.3, 10, -70],
  [30, 30, 1.2, 10, 7.4, -6, -55], [58, 28, 1.8, 11, 2.9, 12, -65], [84, 44, 1.3, 9, 4.8, -14, -85], [18, 82, 1.8, 12, 3.7, 16, -100],
];
export function Poeira({ className = '' }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      {CISCOS.map(([x, y, t, tempo, atraso, dx, dy], i) => (
        <span
          key={i}
          className="cisco"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: t,
            height: t,
            '--tempo': `${tempo}s`,
            '--atraso': `-${atraso}s`,
            '--dx': `${dx}px`,
            '--dy': `${dy}px`,
            '--brilho': 0.45 + (i % 4) * 0.12,
          }}
        />
      ))}
    </div>
  );
}

// sombra do bambuzal projetada na parede pela luminária
export function SombraBambu({ className = '', opacidade = 0.42 }) {
  return (
    <img
      src={`${BASE}/textura/bambu-sombra.webp`}
      alt=""
      aria-hidden="true"
      className={`pointer-events-none absolute max-w-none select-none ${className}`}
      style={{ opacity: opacidade, filter: 'blur(1.5px)' }}
    />
  );
}
