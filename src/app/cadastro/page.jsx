import Pagina from '@/components/Pagina';
import FormCadastro from './FormCadastro';

export const metadata = {
  title: 'Cadastro · indique e ganhe',
  description: 'Faça seu cadastro no Fosco, pegue seu link e ganhe desconto na tattoo a cada amigo que se cadastrar por ele.',
  openGraph: {
    title: 'Bora tatuar no Fosco?',
    description: 'Faça seu cadastro pelo link e ganhe o seu próprio link de indicação. Cada amigo que entrar vira desconto na sua tattoo.',
    images: [{ url: 'og/convite.jpg', width: 1200, height: 630, alt: 'Convite do Fosco Tattoo Studio' }],
  },
};

export default function Cadastro() {
  return (
    <Pagina estilo={{ '--luz-x': '20%', '--luz-y': '35%' }}>
      <FormCadastro />
    </Pagina>
  );
}
