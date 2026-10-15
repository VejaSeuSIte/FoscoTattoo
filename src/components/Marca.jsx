// A marca do Fosco: o «f» gótico que vira punhal (pomo, foice, guarda e lâmina).
// Redesenhada em vetor a partir da estampa das camisetas da equipe.
export const CAMINHOS_MARCA = [
  'M74 5C88 16 97 36 96 60C95 80 85 95 64 108C76 96 83 84 84 70C85 52 84 30 74 5Z',
  'M60 61C68 57 77 58 85 62L85 66C77 63 69 63 61 66Z',
  'M47 66L61 56L51 138L49 175L43 196L24 368L21 262L22 192L14 170L26 161L31 138Z',
  'M40 84C30 90 22 100 19 116C25 104 32 97 39 94Z',
  'M33 130L4 145L32 140Z',
  'M51 128C60 126 70 124 77 121C84 128 83 138 76 142C72 145 71 149 73 152C66 150 66 142 72 138C75 135 75 131 72 130C66 132 58 136 51 138Z',
];

export default function Marca({ className = '', titulo = 'Fosco', ...resto }) {
  return (
    <svg
      viewBox="0 0 100 372"
      className={className}
      fill="currentColor"
      role={titulo ? 'img' : undefined}
      aria-label={titulo || undefined}
      aria-hidden={titulo ? undefined : true}
      {...resto}
    >
      <circle cx="59" cy="25" r="16.5" />
      {CAMINHOS_MARCA.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

// marca + nome, para o cabeçalho e o rodapé
export function Assinatura({ className = '', pequeno = false }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Marca className={pequeno ? 'h-8 w-auto' : 'h-10 w-auto'} titulo="" />
      <span className="flex flex-col leading-none">
        <span className={`font-gotica font-bold ${pequeno ? 'text-[26px]' : 'text-[30px]'} tracking-wide`}>Fosco</span>
        <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.34em] text-osso-2">tattoo studio</span>
      </span>
    </span>
  );
}
