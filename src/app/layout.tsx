import type { Metadata } from 'next';
import './globals.css';
import { InvoiceProvider } from '@/lib/store/invoice-context';

export const metadata: Metadata = {
  title: 'OMEGA FACTURE — SaaS de Facturation & Devis UEMOA',
  description:
    "Solution de facturation professionnelle pour l'Afrique francophone. Conforme UEMOA, montants en FCFA, devis, TVA et partage WhatsApp.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full bg-slate-50/70 dark:bg-[#070a0f] text-slate-900 dark:text-slate-100 antialiased font-sans">
        <InvoiceProvider>{children}</InvoiceProvider>
      </body>
    </html>
  );
}
