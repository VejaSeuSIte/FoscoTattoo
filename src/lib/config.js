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
  chamada: 'Arte, tattoo e piercing num estúdio privado no Recife.',
  endereco_publico: 'Estúdio privado: o endereço vai junto com o horário marcado.',
  horario: 'Atendimento com hora marcada',
  whatsapp: '81996912850',
  endereco: 'Estrada do Caiara, 126 · Iputinga, Recife',
  mapa: 'https://www.google.com/maps/search/?api=1&query=Estrada%20do%20Caiara%2C%20126%2C%20Iputinga%2C%20Recife',
  instagram: 'foscotattoo',
  grupo_whatsapp: '',
  chave_pix: '',
  email: '',
};

export const PROGRAMA_PADRAO = {
  indicacao_ativa: true,
  pontos_por_indicacao: 1,
  pontos_boas_vindas: 0,
  pontos_boas_vindas_indicado: 10,
  pontos_indicado_tatuou: 0,
  percentual_por_ponto: 1,
  desconto_maximo: 50,
  fidelidade_ativa: true,
  fidelidade_sessoes: 6,
  fidelidade_premio: 200,
  sinal_percentual: 30,
};
