import Convite from './Convite';

export const metadata = {
  title: 'Seu convite · 10% de desconto',
  description: 'Um amigo te mandou 10% de desconto na sua tattoo no Fosco Tattoo Studio. O cadastro leva um minuto.',
  openGraph: {
    title: 'Te mandei 10% de desconto no Fosco',
    description: 'Cadastro em um minuto e o desconto fica guardado no seu nome. Fosco Tattoo Studio, Recife.',
    images: [{ url: 'og/convite.jpg', width: 1200, height: 630, alt: 'Convite do Fosco Tattoo Studio: 10% de desconto' }],
  },
};

export default function PaginaConvite() {
  return <Convite />;
}
