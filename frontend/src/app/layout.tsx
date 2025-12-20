import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'SereneMind | Emotional Support AI',
  description: 'A privacy-first mental health support companion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${outfit.variable} min-h-screen bg-[var(--background)] flex flex-col`}>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="py-8 text-center text-gray-400 text-sm">
            <p>© 2025 SereneMind. Not a medical replacement.</p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}


