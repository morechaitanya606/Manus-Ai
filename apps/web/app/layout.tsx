import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AppProviders } from '../components/providers';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import { ToastContainer } from '../components/ui/toast';
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

export const metadata: Metadata = {
  title: {
    default: 'Custyle — AI-Powered Custom Fashion',
    template: '%s | Custyle',
  },
  description:
    'Create stunning AI-generated designs, preview them on realistic apparel mockups, and launch your custom fashion brand. The world\'s first AI Custom Merch Agent.',
  keywords: ['AI fashion', 'custom clothing', 'design studio', 'apparel mockup', 'custom t-shirts'],
  openGraph: {
    title: 'Custyle — AI-Powered Custom Fashion',
    description: 'Create stunning AI-generated designs and launch your custom fashion brand.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen flex flex-col bg-white">
        <AppProviders>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ToastContainer />
        </AppProviders>
      </body>
    </html>
  );
}
