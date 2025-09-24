import { Inter, JetBrains_Mono } from 'next/font/google';
import "./globals.css";

const geistSans = Inter({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = JetBrains_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>Rifa App</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="max-w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          {children}
        </div>
      </body>
    </html>
  );
}
