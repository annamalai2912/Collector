import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Collector — Developer Resource & Vault Saver',
  description: 'Zero-friction link capture, GitHub repository vault, Chrome right-click extension, and AI-powered resource management.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Collector',
  },
  icons: {
    icon: '/icon-192.png',
    shortcut: '/logo.png',
    apple: '/icon-512.png',
  },
  openGraph: {
    title: 'Collector — Developer Resource & Vault Saver',
    description: 'Save tools, repositories, Threads, Instagram, and web resources in seconds.',
    images: ['/logo.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#161b22',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-[#0d1117] text-[#c9d1d9] antialiased min-h-screen pb-16 md:pb-0">
        {children}
      </body>
    </html>
  );
}
