import { Inter, JetBrains_Mono } from 'next/font/google';
import "./globals.css";

const geistSans = Inter({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = JetBrains_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}s`}>
        {children}
      </body>
    </html>
  );
}
