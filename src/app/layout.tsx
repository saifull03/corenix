import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

export const metadata: Metadata = {
  title: 'CORENIX | Enterprise Computing & Technology Ecosystem',
  description: 'Official retailer for high-performance computer hardware, laptops, PC components, enthusiast custom builds, and multi-branch RMA service in Bangladesh.',
  keywords: 'corenix, computer bd, graphics card price, gaming laptop bd, pc builder bangladesh, msi bd, asus bd, rtx 5060 bd',
  openGraph: {
    title: 'CORENIX | Next-Gen Computing Hardware & Tech Ecosystem',
    description: 'Explore the latest graphics cards, processors, DDR5 memory, gaming displays, and instant multi-branch stock.',
    url: 'https://corenix.com.bd',
    siteName: 'CORENIX Bangladesh',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('corenix-theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-navy-950 text-slate-100 min-h-screen selection:bg-brand-500 selection:text-white transition-colors duration-300">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
