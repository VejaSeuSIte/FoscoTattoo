import { LOGO, LOGO_COMPACTO, MARCA } from './vetoresMarca';

// A marca do Fosco: o «f» gótico que vira punhal, no traço oficial do estúdio.
export const CAMINHOS_MARCA = [MARCA.d];

export default function Marca({ className = '', titulo = 'Fosco', ...resto }) {
  return (
    <svg
      viewBox={`0 0 ${MARCA.largura} ${MARCA.altura}`}
      className={className}
      fill="currentColor"
      role={titulo ? 'img' : undefined}
      aria-label={titulo || undefined}
      aria-hidden={titulo ? undefined : true}
      {...resto}
    >
      <path fillRule="evenodd" d={MARCA.d} />
    </svg>
  );
}

// o nome por extenso, FOSCO · TATTOO STUDIO; o compacto encurta a lâmina do «f»
export function Logotipo({ compacto = false, className = '', titulo = 'Fosco Tattoo Studio', ...resto }) {
  const v = compacto ? LOGO_COMPACTO : LOGO;
  return (
    <svg
      viewBox={v.viewBox}
      className={className}
      fill="currentColor"
      role={titulo ? 'img' : undefined}
      aria-label={titulo || undefined}
      aria-hidden={titulo ? undefined : true}
      {...resto}
    >
      <path fillRule="evenodd" d={v.d} />
    </svg>
  );
}

// o logo do cabeçalho e de onde mais o nome aparece pequeno
export function Assinatura({ className = '', pequeno = false }) {
  return <Logotipo compacto className={`${pequeno ? 'h-[50px]' : 'h-[64px]'} w-auto ${className}`} />;
}
