import type { Metadata } from 'next';
import { Providers } from './providers';
import AppLayout from '@/components/layout/AppLayout';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Doorslam',
  description: 'Revision without the drama',
  icons: {
    icon: '/images/logo-dark.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}
