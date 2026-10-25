'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useInvoices } from '@/lib/store/invoice-context';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/verify-email',
  '/confirm-email',
  '/auth/confirm',
  '/api/',
];

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, authLoading, currentUser, pendingVerificationUser } = useInvoices();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?')
  );

  useEffect(() => {
    if (!mounted || authLoading) return;

    // 1. Sur une route publique (/login, /register) alors qu'on est déjà connecté
    if (isPublic) {
      if (isAuthenticated && currentUser?.emailVerified && (pathname === '/login' || pathname === '/register')) {
        router.replace('/');
      }
      return;
    }

    // 2. Sur une route protégée sans être authentifié
    if (!isAuthenticated || !currentUser) {
      router.replace('/login');
      return;
    }

    // 3. Compte en attente de validation d'email
    if (!currentUser.emailVerified) {
      const email = currentUser.email || pendingVerificationUser?.email || '';
      router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
      return;
    }
  }, [mounted, authLoading, isAuthenticated, currentUser, pendingVerificationUser, pathname, isPublic, router]);

  // Route publique : rendu direct sans blocage
  if (isPublic) {
    return <>{children}</>;
  }

  // Avant le montage côté client : rendre le contenu directement pour éviter tout blocage SSR
  if (!mounted) {
    return <>{children}</>;
  }

  // Si non authentifié sur une route protégée : la redirection vers /login s'exécute, aucun écran de blocage persistant
  if (!isAuthenticated || !currentUser || !currentUser.emailVerified) {
    return null;
  }

  return <>{children}</>;
};
