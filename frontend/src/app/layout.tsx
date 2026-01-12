import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'DueDiligence - AI-Powered Company Research',
  description: 'Get comprehensive due diligence reports on any company in minutes. AI-powered research platform for investment professionals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
