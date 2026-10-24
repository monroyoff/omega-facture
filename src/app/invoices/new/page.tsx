'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPage from '@/app/page';

export default function CreateInvoicePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const k = params.get('kind') || params.get('type');
      const createKind = k === 'quote' || k === 'devis' ? 'quote' : 'invoice';
      router.replace(`/?create=${createKind}`);
    }
  }, [router]);

  return <DashboardPage />;
}
