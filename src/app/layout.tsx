import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Collector — Developer Resource & Vault Saver',
  description: 'Zero-friction link capture, GitHub repository vault, Chrome right-click extension, and AI-powered resource management.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Collector — Developer Resource & Vault Saver',
    description: 'Save tools, repositories, Threads, Instagram, and web resources in seconds.',
    images: ['/logo.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#161b22',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d1117] text-[#c9d1d9] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
