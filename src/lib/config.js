// Endereço e chave PUBLICÁVEL do banco (projeto Supabase «Kitsune»).
// A chave publicável pode ir para o site; a de serviço nunca sai das funções.
export const SUPABASE_URL = 'https://kqpdoyidalucsiqksjtr.supabase.co';
export const SUPABASE_CHAVE = 'sb_publishable_fJOwnHy3XZuARp_Z0nhTRw_16yL_cpK';
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const BALDE_PUBLICO = 'fosco';
export const BALDE_REFERENCIAS = 'fosco-referencias';

// valores de reserva enquanto o banco não responde (ou se cair)
export const ESTUDIO_PADRAO = {
  nome: 'Fosco Tattoo Studio',
  nome_curto: 'Fosco',
  cidade: 'Recife · PE',
  chamada: 'Arte, tattoo e piercing no Recife.',
  endereco_publico: 'Estrada do Caiara, 126 · Iputinga, Recife.',
  horario: '',
  whatsapp: '81996912850',
  endereco: 'Estrada do Caiara, 126 · Iputinga, Recife',
  mapa: 'https://www.google.com/maps/place/Fosco+Tattoo+Studio/@-8.0418154,-34.9334011,17z/data=!3m1!4b1!4m6!3m5!1s0x7ab19f57bb9e755:0x769bbc1ec87f8e71!8m2!3d-8.0418154!4d-34.9308262!16s%2Fg%2F11mlsdwp8t',
  instagram: 'foscotattoo',
  grupo_whatsapp: '',
  chave_pix: '',
  email: '',
};

export const PROGRAMA_PADRAO = {
  indicacao_ativa: true,
  pontos_primeira_indicacao: 10,
  pontos_por_indicacao: 1,
  pontos_boas_vindas: 0,
  pontos_boas_vindas_indicado: 1,
  pontos_indicado_tatuou: 0,
  percentual_por_ponto: 1,
  desconto_maximo: 50,
  fidelidade_ativa: true,
  fidelidade_sessoes: 6,
  fidelidade_premio: 200,
  sinal_percentual: 30,
};
