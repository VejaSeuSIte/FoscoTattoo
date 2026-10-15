import Pagina from '@/components/Pagina';

export const metadata = { title: 'Privacidade', description: 'Como o Fosco Tattoo Studio guarda e usa os seus dados.' };

const BLOCOS = [
  [
    'O que a gente guarda',
    'No cadastro: nome, CPF, WhatsApp, data de nascimento e, se você quiser, e-mail. No pedido de orçamento: nome, WhatsApp, a descrição da ideia e as fotos de referência que você mandar. Quando você tatua, o estúdio anota a data da sessão para o cartão fidelidade.',
  ],
  [
    'Pra que serve',
    'O CPF garante que cada pessoa tenha um cadastro só, o que mantém o programa de indicação justo. O WhatsApp é por onde a gente responde orçamento e fala com você. A data de nascimento é para a mensagem de aniversário. As fotos de referência servem só para montar o orçamento.',
  ],
  ['Promoções', 'Mensagem de vaga com desconto e novidade só vai para quem marcou que quer receber. Você muda isso quando quiser na sua área do site.'],
  ['Quem vê', 'Só o estúdio. Seus dados não são vendidos nem passados para ninguém. Quem você indicou aparece para você só pelo primeiro nome.'],
  ['Seus direitos', 'Você pode ver e corrigir seus dados na sua área. Para apagar o cadastro inteiro, é só pedir pelo WhatsApp ou pelo direct do Instagram que a gente apaga.'],
];

export default function Privacidade() {
  return (
    <Pagina estilo={{ '--luz-x': '50%', '--luz-y': '6%' }}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <article className="papel relative rounded-[4px] px-6 pb-10 pt-12 sm:px-12" style={{ transform: 'rotate(-0.5deg)' }}>
          <span
            aria-hidden="true"
            className="absolute -top-3 left-10 h-7 w-24 -rotate-6"
            style={{ background: 'rgba(214,196,150,.75)', clipPath: 'polygon(3% 8%,0 30%,4% 52%,0 74%,3% 96%,97% 92%,100% 70%,96% 48%,100% 26%,97% 4%)' }}
          />
          <span
            aria-hidden="true"
            className="absolute -top-3 right-12 h-7 w-24 rotate-6"
            style={{ background: 'rgba(214,196,150,.75)', clipPath: 'polygon(3% 8%,0 30%,4% 52%,0 74%,3% 96%,97% 92%,100% 70%,96% 48%,100% 26%,97% 4%)' }}
          />
          <h1 className="font-gotica text-[clamp(52px,9vw,76px)] font-bold leading-[0.9] text-papel-tinta">Seus dados</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#4a3a2c]">O jeito que o Fosco guarda e usa as informações de quem se cadastra no site, em poucas palavras.</p>
          <div className="mt-10 space-y-8">
            {BLOCOS.map(([t, d]) => (
              <section key={t}>
                <h2 className="font-gotica text-[28px] font-bold text-papel-tinta">{t}</h2>
                <p className="mt-2 text-[16px] leading-relaxed text-[#3e2f24]">{d}</p>
              </section>
            ))}
          </div>
        </article>
      </div>
    </Pagina>
  );
}
