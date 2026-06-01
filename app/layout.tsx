import type {Metadata} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Hambúrguer Artesanal | O Sabor Premium em Cada Mordida',
  description: 'A verdadeira experiência do Hambúrguer Artesanal Angus. Pão selado na manteiga, carnes suculentas grelhadas na brasa e molhos secretos.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body suppressHydrationWarning className="bg-[#050505] text-white antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

