import Convite from './Convite';

export const metadata = {
  title: 'Você foi indicado ao Fosco',
  description: 'Faça sua 1ª indicação e ganhe 10% de desconto na sua tattoo no Fosco Tattoo Studio, em Recife. O cadastro leva um minuto.',
  openGraph: {
    title: 'Te indiquei o Fosco Tattoo Studio',
    description: 'Faça sua 1ª indicação e ganhe 10% de desconto. Cadastro em um minuto e seu link sai na hora.',
    images: [{ url: 'og/convite.jpg', width: 1200, height: 630, alt: 'Fosco Tattoo Studio: faça sua 1ª indicação e ganhe 10% de desconto' }],
  },
};

export default function PaginaConvite() {
  return <Convite />;
}
