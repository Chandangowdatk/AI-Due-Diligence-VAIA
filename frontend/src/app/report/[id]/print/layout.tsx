import '@/styles/globals.css';
import '@/styles/print.css';

export const metadata = {
  title: 'Due Diligence Report - Print View',
};

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
