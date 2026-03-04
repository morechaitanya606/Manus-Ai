import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { AppProviders } from '../components/providers';
import { ErrorBoundary } from '../components/error-boundary';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import { ToastContainer } from '../components/ui/toast';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'EVERYDAYDROP — Custom Print-on-Demand Fashion',
    template: '%s | EVERYDAYDROP',
  },
  description:
    'Create stunning AI-generated designs, preview them on realistic apparel mockups, and launch your custom fashion brand. The world\'s first AI Custom Merch Agent.',
  keywords: ['AI fashion', 'custom clothing', 'design studio', 'apparel mockup', 'custom t-shirts'],
  openGraph: {
    title: 'EVERYDAYDROP — Custom Print-on-Demand Fashion',
    description: 'Create stunning AI-generated designs and launch your custom fashion brand.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A0A0C',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans min-h-screen flex flex-col bg-void text-text-main selection:bg-cyan selection:text-void" suppressHydrationWarning>
        <AppProviders>
          <Navbar />
          <main className="flex-1">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          <Footer />
          <ToastContainer />
          <Toaster position="bottom-right" richColors />
        </AppProviders>
      </body>
    </html>
  );
}
