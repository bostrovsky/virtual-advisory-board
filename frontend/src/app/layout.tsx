import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './stripe-styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Virtual Advisory Board',
  description: 'AI-powered advisory board with expert advisors',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Advisory Board',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-152x152.svg', sizes: '152x152', type: 'image/svg+xml' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} antialiased h-full overflow-hidden`} style={{backgroundColor: 'var(--tt-container)'}}>
        <div className="h-full">
          {children}
        </div>
      </body>
    </html>
  );
}