// Gera a parede de tijolinho do estúdio em vetor (public/textura/tijolos.svg).
// Fundo escuro não leva textura em imagem comprimida (vira bloco); aqui cada
// tijolo é um retângulo com tom próprio, luz no topo, sombra embaixo e um
// pontilhado de barro feito pelo próprio navegador.
import { writeFileSync, mkdirSync } from 'node:fs';

let semente = 7;
const acaso = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);

const L = 108; // largura do tijolo
const A = 44; // altura
const R = 6; // rejunte
const COLS = 5;
const LINHAS = 6;
const W = COLS * (L + R);
const H = LINHAS * (A + R);

const tons = ['#3b2517', '#34200f', '#432a1a', '#2e1c11', '#4a2f1d', '#3f2716', '#38231a'];

// cada coluna sorteia uma vez por linha: o tijolo que sai pela direita é o
// mesmo que entra pela esquerda, então a emenda do ladrilho não aparece
const sorteio = Array.from({ length: LINHAS }, () =>
  Array.from({ length: COLS }, () => ({
    tom: tons[Math.floor(acaso() * tons.length)],
    brilho: 0.05 + acaso() * 0.1,
    largura: L - acaso() * 3,
    altura: A - acaso() * 2,
  })),
);

const tijolos = [];
for (let y = 0; y < LINHAS; y++) {
  const desloca = y % 2 ? (L + R) / 2 : 0;
  for (let x = -1; x <= COLS; x++) {
    const px = x * (L + R) + desloca + R / 2;
    const py = y * (A + R) + R / 2;
    if (px > W || px + L < 0) continue;
    const s = sorteio[y][(x + COLS) % COLS];
    const tom = s.tom;
    const brilho = s.brilho.toFixed(3);
    const largura = s.largura.toFixed(1);
    const altura = s.altura.toFixed(1);
    tijolos.push(
      `<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)})">` +
        `<rect width="${largura}" height="${altura}" rx="3" fill="${tom}"/>` +
        `<rect width="${largura}" height="${altura}" rx="3" fill="url(#face)" opacity="${brilho * 6}"/>` +
        `<rect x="2" y="1.5" width="${(largura - 4).toFixed(1)}" height="2" rx="1" fill="#f0c79a" opacity="${brilho}"/>` +
        `</g>`,
    );
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
<linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#7a4d2c" stop-opacity=".55"/>
<stop offset=".55" stop-color="#000" stop-opacity="0"/>
<stop offset="1" stop-color="#000" stop-opacity=".5"/>
</linearGradient>
<filter id="barro" x="0" y="0" width="100%" height="100%">
<feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" stitchTiles="stitch"/>
<feColorMatrix values="0 0 0 0 .06  0 0 0 0 .035  0 0 0 0 .02  0 0 0 -2.2 1.3"/>
<feComposite in2="SourceGraphic" operator="in"/>
</filter>
</defs>
<rect width="${W}" height="${H}" fill="#0f0a07"/>
<g id="parede">${tijolos.join('')}</g>
<use href="#parede" filter="url(#barro)" opacity=".55"/>
</svg>
`;

mkdirSync(new URL('../public/textura/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/textura/tijolos.svg', import.meta.url), svg);
console.log('tijolos.svg', W, 'x', H, (svg.length / 1024).toFixed(1), 'KB');
