import Pagina from '@/components/Pagina';
import FormEntrar from './FormEntrar';

export const metadata = { title: 'Entrar', description: 'Entre com seu CPF e senha para ver seus pontos, seu link de indicação e seu cartão fidelidade.' };

export default function Entrar() {
  return (
    <Pagina estilo={{ '--luz-x': '50%', '--luz-y': '20%' }}>
      <FormEntrar />
    </Pagina>
  );
}
