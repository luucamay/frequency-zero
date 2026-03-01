import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Frequency Zero',
  description: 'An agentic radio network where users fuel AI whistleblowers broadcasting synthetic truths.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="bg-zinc-950 text-zinc-50 font-sans antialiased overflow-x-hidden">
        <div className="noise-bg"></div>
        <div className="scanline"></div>
        {children}
      </body>
    </html>
  );
}
