import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Link Vault - Personal Tool & GitHub Repo Vault',
  description: 'Zero-friction link capture, GitHub repository vault, and AI-powered resource management.',
  manifest: '/manifest.json',
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
