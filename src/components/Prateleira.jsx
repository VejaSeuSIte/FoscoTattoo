// A prateleira de madeira onde a parede de tijolo termina: em vez do corte reto
// entre as seções, uma tábua com as coisas do estúdio em cima (bambu, livros,
// frascos de tinta, vela, máquina, porta-retrato), iluminadas de cima.
import { CAMINHOS_MARCA } from './Marca';

function Bambu({ x }) {
  return (
    <g transform={`translate(${x} 0)`}>
      {[[-14, 6, -6], [2, 0, 3], [16, 14, 8]].map(([dx, topo, giro], i) => (
        <g key={i} transform={`rotate(${giro} ${dx} 128)`}>
          <rect x={dx - 2.5} y={topo + 6} width="5" height={122 - topo} rx="2" fill="#56622f" />
          <rect x={dx - 2.5} y={topo + 6} width="1.8" height={122 - topo} fill="#7c8a4c" opacity=".7" />
          {[30, 58, 86].map((n) => (
            <rect key={n} x={dx - 3.2} y={topo + n} width="6.4" height="2.2" rx="1" fill="#3f4823" />
          ))}
          {[22, 48, 74].map((n, j) => (
            <path
              key={n}
              d={`M${dx} ${topo + n} q${j % 2 ? -22 : 22} -6 ${j % 2 ? -34 : 34} 6 q${j % 2 ? 18 : -18} 2 ${j % 2 ? 34 : -34} -6z`}
              fill={j % 2 ? '#6f7d45' : '#5f6b3a'}
            />
          ))}
        </g>
      ))}
      <path d="M-26 98 h52 l-6 32 h-40z" fill="#2b1d15" />
      <rect x="-28" y="94" width="56" height="7" rx="2" fill="#4a3324" />
      <rect x="-28" y="94" width="56" height="2" rx="1" fill="#8a5a32" opacity=".8" />
    </g>
  );
}

function Livros({ x }) {
  const pilha = [
    [0, 64, 13, '#3a1a1c'],
    [4, 58, 12, '#261a14'],
    [-3, 70, 11, '#6e4424'],
  ];
  let y = 130;
  return (
    <g transform={`translate(${x} 0)`}>
      {pilha.map(([dx, w, h, cor], i) => {
        y -= h;
        return (
          <g key={i}>
            <rect x={dx - w / 2} y={y} width={w} height={h} rx="1.5" fill={cor} />
            <rect x={dx - w / 2} y={y} width={w} height="1.6" fill="#c9a06a" opacity=".45" />
            <rect x={dx - w / 2 + 6} y={y + h / 2 - 1} width={w * 0.4} height="2" fill="#d9caa9" opacity=".5" />
          </g>
        );
      })}
      {/* o sketchbook aberto em pé */}
      <g transform={`rotate(-8 ${44} 130)`}>
        <rect x="30" y="66" width="34" height="64" rx="2" fill="#d9caa9" />
        <rect x="30" y="66" width="34" height="64" rx="2" fill="none" stroke="#7a6248" strokeWidth="1.2" />
        <g transform="translate(40.5 70) scale(0.13)" fill="#3e2f24">
          {CAMINHOS_MARCA.map((d, i) => (
            <path key={i} fillRule="evenodd" d={d} />
          ))}
        </g>
      </g>
    </g>
  );
}

function Frascos({ x }) {
  const frascos = [
    [-30, 44, '#141010', '#b5402e'],
    [0, 54, '#141010', '#d8954c'],
    [28, 40, '#2a1210', '#ebdfc7'],
  ];
  return (
    <g transform={`translate(${x} 0)`}>
      {frascos.map(([dx, h, vidro, tampa], i) => (
        <g key={i} transform={`translate(${dx} 0)`}>
          <path d={`M-11 ${130 - h + 10} q0 -6 6 -7 h10 q6 1 6 7 v${h - 12} q0 2 -2 2 h-18 q-2 0 -2 -2z`} fill={vidro} />
          <rect x="-6" y={130 - h - 6} width="12" height="9" rx="2" fill={tampa} />
          <rect x="-9" y={130 - h + 16} width="18" height="13" rx="1" fill="#e9dcc0" opacity=".85" />
          <rect x="-6" y={130 - h + 20} width="12" height="1.6" fill="#3e2f24" opacity=".6" />
          <rect x="-9" y={130 - h + 6} width="3" height={h - 12} fill="#fff" opacity=".07" />
        </g>
      ))}
    </g>
  );
}

function Vela({ x }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <circle cx="0" cy="66" r="44" fill="url(#prat-luz)" />
      <rect x="-11" y="80" width="22" height="50" rx="3" fill="#e8dcc4" />
      <path d="M-11 86 q4 6 2 14 q-1 4 2 4 q3 0 2 -6 q-1 -8 3 -12z" fill="#d9caa9" />
      <rect x="-11" y="80" width="22" height="4" rx="2" fill="#f6eedd" />
      <rect x="-0.8" y="73" width="1.6" height="8" fill="#2a1d15" />
      <path className="chama" d="M0 52 q8 12 4 20 q-2 4 -4 4 q-2 0 -4 -4 q-4 -8 4 -20z" fill="#ffd08f" />
      <path className="chama" d="M0 62 q4 7 2 11 q-1 2 -2 2 q-1 0 -2 -2 q-2 -4 2 -11z" fill="#fff4dc" />
      <rect x="-18" y="126" width="36" height="5" rx="2" fill="#4a3324" />
    </g>
  );
}

function Maquina({ x }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M40 124 q30 -2 40 -18 q8 -14 30 -12" fill="none" stroke="#141010" strokeWidth="3" strokeLinecap="round" />
      <g transform="rotate(-6 0 120)">
        <rect x="-52" y="112" width="96" height="14" rx="7" fill="#1f1a17" />
        <rect x="-52" y="112" width="96" height="4" rx="2" fill="#6b5f55" opacity=".7" />
        <rect x="-18" y="110" width="34" height="18" rx="6" fill="#2b2420" />
        {[-14, -8, -2, 4, 10].map((g) => (
          <rect key={g} x={g} y="111" width="2" height="16" fill="#120e0c" />
        ))}
        <path d="M-52 114 l-24 5 l24 5z" fill="#8f8068" />
        <rect x="44" y="114" width="8" height="10" rx="2" fill="#b5402e" />
      </g>
    </g>
  );
}

function Retrato({ x }) {
  return (
    <g transform={`translate(${x} 0) rotate(6 0 130)`}>
      <rect x="-24" y="74" width="48" height="58" rx="2" fill="#1d140e" />
      <rect x="-19" y="79" width="38" height="48" fill="#d9caa9" />
      <rect x="-15" y="83" width="30" height="40" fill="#2a1d15" />
      <g transform="translate(-4.6 85) scale(0.1)" fill="#d8954c">
        <circle cx="59" cy="25" r="16.5" />
        {CAMINHOS_MARCA.map((d, i) => (
          <path key={i} fillRule="evenodd" d={d} />
        ))}
      </g>
      <rect x="-24" y="74" width="48" height="2" fill="#8a5a32" opacity=".6" />
    </g>
  );
}

const ARRANJOS = [
  [[Bambu, 120], [Livros, 330], [Vela, 560], [Frascos, 760], [Maquina, 960], [Retrato, 1110]],
  [[Retrato, 100], [Frascos, 260], [Vela, 440], [Maquina, 640], [Livros, 860], [Bambu, 1080]],
  [[Vela, 110], [Bambu, 290], [Maquina, 500], [Retrato, 700], [Frascos, 880], [Livros, 1060]],
];

export default function Prateleira({ variante = 0, className = '' }) {
  const itens = ARRANJOS[variante % ARRANJOS.length];
  return (
    <div className={`relative z-10 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 176" preserveAspectRatio="xMidYMax meet" className="mx-auto block h-auto w-full max-w-[1200px]">
        <defs>
          <radialGradient id="prat-luz" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffd08f" stopOpacity=".45" />
            <stop offset="1" stopColor="#ffd08f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="prat-madeira" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a4e2c" />
            <stop offset=".25" stopColor="#5a3820" />
            <stop offset="1" stopColor="#2e1c10" />
          </linearGradient>
          <linearGradient id="prat-sombra" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity=".55" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>
        {itens.map(([Item, x], i) => (
          <Item key={i} x={x} />
        ))}
        <rect x="0" y="130" width="1200" height="18" fill="url(#prat-madeira)" />
        <rect x="0" y="130" width="1200" height="2" fill="#b07a46" opacity=".75" />
        {[60, 230, 410, 600, 790, 980, 1150].map((v, i) => (
          <path key={v} d={`M${v} 136 q${30 + i * 4} ${i % 2 ? 3 : -2} ${70 + i * 6} 0`} fill="none" stroke="#2a1a0e" strokeWidth="1" opacity=".5" />
        ))}
        <rect x="0" y="148" width="1200" height="28" fill="url(#prat-sombra)" />
        {[200, 1000].map((v) => (
          <path key={v} d={`M${v - 4} 148 h8 v14 l-26 0 v-4 l18 0z`} fill="#141010" />
        ))}
      </svg>
    </div>
  );
}
