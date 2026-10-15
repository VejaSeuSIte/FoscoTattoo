// Renderiza um SVG para PNG (pré-visualização): node render-svg.cjs entrada.svg saida.png [largura]
const { Resvg } = require('C:/Users/gabri/RaposaAnalitica/node_modules/@resvg/resvg-js');
const fs = require('fs');
const [, , ent, sai, w] = process.argv;
const r = new Resvg(fs.readFileSync(ent, 'utf8'), { fitTo: { mode: 'width', value: Number(w || 300) }, font: { loadSystemFonts: true } });
fs.writeFileSync(sai, r.render().asPng());
console.log('ok', sai);
