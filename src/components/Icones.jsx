// Ícones desenhados para o site (traço de 1.7, pontas redondas)
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const IconeZap = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 19.5l1.2-3.9A8 8 0 1 1 8.6 18.4z" />
    <path d="M9.2 8.6c.2-.5.5-.6.8-.6h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c.6 1.2 1.5 2.1 2.7 2.7l.6-.5c.2-.1.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3-.1.6-.6.8-.6.3-1.7.3-3.2-.4a8.6 8.6 0 0 1-3.6-3.6c-.7-1.5-.7-2.6-.4-3.2z" />
  </svg>
);
export const IconeInsta = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.8" />
    <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
  </svg>
);
export const IconeSeta = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5" />
  </svg>
);
export const IconeVoltar = (p) => (
  <svg {...base} {...p}>
    <path d="M19 12H6M11 6.5L5.5 12l5.5 5.5" />
  </svg>
);
export const IconeCopiar = (p) => (
  <svg {...base} {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
    <path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" />
  </svg>
);
export const IconeCompartilhar = (p) => (
  <svg {...base} {...p}>
    <path d="M12 15V4M8 7.5L12 3.5l4 4" />
    <path d="M7 11H6a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 18 11h-1" />
  </svg>
);
export const IconeMenu = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);
export const IconeFechar = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const IconeOlho = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);
export const IconeOlhoFechado = (p) => (
  <svg {...base} {...p}>
    <path d="M3 3l18 18M10.6 5.6A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.7M6.3 6.9A15.6 15.6 0 0 0 2.5 12s3.5 6.5 9.5 6.5a9 9 0 0 0 4.2-1" />
    <path d="M9.9 9.9a2.8 2.8 0 0 0 4.2 4.2" />
  </svg>
);
export const IconeSair = (p) => (
  <svg {...base} {...p}>
    <path d="M14 4.5h3.5A1.5 1.5 0 0 1 19 6v12a1.5 1.5 0 0 1-1.5 1.5H14M10 16.5L5.5 12 10 7.5M5.5 12H15" />
  </svg>
);
export const IconeMais = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconeLixo = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 7h15M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M6.5 7l.8 11.6A1.5 1.5 0 0 0 8.8 20h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
  </svg>
);
export const IconeLapis = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 19.5l1-4L16 5a2.1 2.1 0 0 1 3 3L8.5 18.5z" />
    <path d="M14 7l3 3" />
  </svg>
);
export const IconeBolo = (p) => (
  <svg {...base} {...p}>
    <path d="M4 20h16M5 20v-6.5A1.5 1.5 0 0 1 6.5 12h11a1.5 1.5 0 0 1 1.5 1.5V20" />
    <path d="M5 15.5c1.2 1 2.3 1 3.5 0s2.3-1 3.5 0 2.3 1 3.5 0 2.3-1 3.5 0M12 12V9" />
    <path d="M12 6.5c-.9-.8-.9-1.8 0-3 .9 1.2.9 2.2 0 3z" />
  </svg>
);
export const IconeCasa = (p) => (
  <svg {...base} {...p}>
    <path d="M4 10.5L12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />
  </svg>
);
export const IconePessoas = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
    <path d="M15.5 5.6a3.1 3.1 0 0 1 0 5.8M17.5 14.8c1.6.6 2.7 2.2 3 4.7" />
  </svg>
);
export const IconeBalao = (p) => (
  <svg {...base} {...p}>
    <path d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v8.5A1.5 1.5 0 0 1 19 17h-8l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5V7A1.5 1.5 0 0 1 5 5.5z" />
    <path d="M8 10h8M8 13h5" />
  </svg>
);
export const IconeMoldura = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="5" width="16" height="15" rx="1.5" />
    <path d="M12 2.5l-3 2.5M12 2.5l3 2.5M7.5 16.5l3.5-4 2.5 2.5 1.5-1.5 2 3" />
  </svg>
);
export const IconeAjustes = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </svg>
);
export const IconeAgulha = (p) => (
  <svg {...base} {...p}>
    <path d="M14.5 4.5l5 5M17 7l-9.5 9.5M6 18l-2 2M9.5 14.5l-2 2-1.5-1.5 2-2M12.5 6.5l5 5" />
  </svg>
);
export const IconeBusca = (p) => (
  <svg {...base} {...p}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15l5 5" />
  </svg>
);
export const IconeCheck = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const IconeEmail = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);
export const IconePino = (p) => (
  <svg {...base} {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
);
export const IconeGota = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5s6 6.6 6 10.8a6 6 0 0 1-12 0C6 10.1 12 3.5 12 3.5z" />
    <path d="M9.2 14.6a2.9 2.9 0 0 0 2.8 2.6" />
  </svg>
);
export const IconeSol = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5" />
  </svg>
);
export const IconeOndas = (p) => (
  <svg {...base} {...p}>
    <path d="M3 9c1.5-1.4 3-1.4 4.5 0s3 1.4 4.5 0 3-1.4 4.5 0 3 1.4 4.5 0M3 14c1.5-1.4 3-1.4 4.5 0s3 1.4 4.5 0 3-1.4 4.5 0 3 1.4 4.5 0M3 19c1.5-1.4 3-1.4 4.5 0s3 1.4 4.5 0 3-1.4 4.5 0 3 1.4 4.5 0" />
  </svg>
);
export const IconeHaltere = (p) => (
  <svg {...base} {...p}>
    <path d="M7 8v8M4.5 9.5v5M17 8v8M19.5 9.5v5M7 12h10" />
  </svg>
);
export const IconeCamarao = (p) => (
  <svg {...base} {...p}>
    <path d="M18.5 6.5c-4.5-1.5-11 .5-12 6-.6 3.3 1.5 5.5 4 5.5 2 0 3-1.4 3-2.8" />
    <path d="M18.5 6.5c.6 2.6-.6 5.4-3.5 6.4M9.5 9.3l1.4 2.6M12.5 8.2l.8 2.7M6.9 12.7l2.6.6M13.5 15.2c-1.2 1.1-1.2 2.6 0 3.8M18.5 6.5l2-2" />
  </svg>
);
export const IconePata = (p) => (
  <svg {...base} {...p}>
    <path d="M12 12.5c-2.6 0-4.8 2.6-4.8 4.6 0 1.6 1.4 2.4 2.7 2 1.4-.4 2.8-.4 4.2 0 1.3.4 2.7-.4 2.7-2 0-2-2.2-4.6-4.8-4.6z" />
    <ellipse cx="8" cy="8.3" rx="1.6" ry="2.1" />
    <ellipse cx="16" cy="8.3" rx="1.6" ry="2.1" />
    <ellipse cx="4.9" cy="12.3" rx="1.4" ry="1.8" />
    <ellipse cx="19.1" cy="12.3" rx="1.4" ry="1.8" />
  </svg>
);
export const IconeCasquinha = (p) => (
  <svg {...base} {...p}>
    <path d="M4.5 15.5l9.8-9.8a3 3 0 0 1 4.2 4.2l-9.8 9.8a3 3 0 0 1-4.2-4.2z" />
    <path d="M10 10l4 4M11.6 8.4l.9.9M8.4 11.6l.9.9M13.2 13.2l.9.9" />
  </svg>
);
export const IconeCartao = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <circle cx="8" cy="12" r="1.8" />
    <circle cx="12.5" cy="12" r="1.8" />
    <circle cx="17" cy="12" r="1.8" strokeDasharray="1.5 1.6" />
  </svg>
);
export const IconePresente = (p) => (
  <svg {...base} {...p}>
    <rect x="4" y="9" width="16" height="11" rx="1.5" />
    <path d="M3 9h18M12 9v11M12 9C10 5 6.5 5.2 7 7.6 7.3 9 12 9 12 9zM12 9c2-4 5.5-3.8 5-1.4C16.7 9 12 9 12 9z" />
  </svg>
);
export const IconeImprimir = (p) => (
  <svg {...base} {...p}>
    <path d="M7 9V4h10v5M7 17H5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 5 9h14a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 19 17h-2" />
    <rect x="7" y="14" width="10" height="6" rx="1" />
  </svg>
);
export const IconeExterno = (p) => (
  <svg {...base} {...p}>
    <path d="M14 4.5h5.5V10M19.5 4.5L11 13M17 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7H10" />
  </svg>
);
