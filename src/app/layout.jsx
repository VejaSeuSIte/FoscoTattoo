import { Grenze_Gotisch, Archivo, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { VitrineProvider } from '@/lib/vitrine';
import CapturaIndicacao from '@/components/CapturaIndicacao';
import { BASE } from '@/lib/config';

const gotica = Grenze_Gotisch({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--fonte-gotica', display: 'swap' });
const corpo = Archivo({ subsets: ['latin'], variable: '--fonte-corpo', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--fonte-mono', display: 'swap' });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://vejaseusite.github.io/FoscoTattoo';

export const metadata = {
  metadataBase: new URL(SITE.endsWith('/') ? SITE : SITE + '/'),
  title: { default: 'Fosco Tattoo Studio · Recife', template: '%s · Fosco Tattoo Studio' },
  description: 'Arte, tattoo e piercing num estúdio privado no Recife. Peça seu orçamento, conheça a equipe e ganhe desconto indicando amigos.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Fosco Tattoo Studio',
    images: [{ url: 'og/fosco.jpg', width: 1200, height: 630, alt: 'Fosco Tattoo Studio' }],
  },
  icons: { icon: `${BASE}/favicon.svg`, apple: `${BASE}/icone-180.png` },
};

export const viewport = { themeColor: '#0b0806', width: 'device-width', initialScale: 1 };

export default function Layout({ children }) {
  return (
    <html lang="pt-BR" className={`${gotica.variable} ${corpo.variable} ${mono.variable}`}>
      <body>
        <VitrineProvider>
          <CapturaIndicacao />
          {children}
        </VitrineProvider>
      </body>
    </html>
  );
}
