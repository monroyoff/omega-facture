'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * AutoUpdateWatcher
 * 
 * Surveille en continu l'état des déploiements et applique instantanément
 * les nouvelles versions sans aucune action requise de la part de l'utilisateur.
 * 
 * Déclencheurs de vérification automatique :
 * 1. Au chargement initial
 * 2. Changement de route (navigation interne)
 * 3. Retour au premier plan (sur smartphone lors du déverrouillage ou retour sur l'app)
 * 4. Événement focus de la fenêtre
 * 5. Heartbeat périodique (toutes les 40 secondes)
 * 6. Réception de message Service Worker (SW_ACTIVATED)
 * 
 * Sécurité ergonomique :
 * Ne recharge pas au milieu d'une saisie dans un champ texte (input/textarea)
 * pour éviter d'interrompre l'utilisateur en cours de travail.
 */
export const AutoUpdateWatcher: React.FC = () => {
  const pathname = usePathname();
  const currentVersionRef = useRef<string | null>(null);
  const isReloadingRef = useRef<boolean>(false);
  const pendingReloadRef = useRef<boolean>(false);

  // Vérifie si l'utilisateur est en train d'écrire dans un champ de saisie
  const isUserTyping = (): boolean => {
    if (typeof document === 'undefined') return false;
    const activeEl = document.activeElement;
    if (!activeEl) return false;
    const tag = activeEl.tagName.toLowerCase();
    const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';
    const isEditable = activeEl.getAttribute('contenteditable') === 'true';
    return isInput || isEditable;
  };

  // Exécute la mise à jour transparente
  const executeAutoReload = async () => {
    if (isReloadingRef.current) return;
    if (isUserTyping()) {
      // L'utilisateur est en cours de saisie, reporter à la fin de la saisie
      pendingReloadRef.current = true;
      return;
    }

    isReloadingRef.current = true;

    try {
      // Purge de tous les caches locaux
      if (typeof window !== 'undefined' && 'caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      // Actualisation immédiate du Service Worker
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.update();
        }
      }
    } catch (e) {
      console.warn('[AutoUpdate] Erreur purge cache:', e);
    }

    // Rechargement transparent
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Fonction de vérification auprès du serveur
  const checkForNewVersion = async () => {
    if (isReloadingRef.current) return;
    if (typeof window === 'undefined') return;

    try {
      // Appel direct sans cache
      const response = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      const serverVersion = data?.version;

      if (!serverVersion) return;

      // Premier appel : initialisation
      if (!currentVersionRef.current) {
        currentVersionRef.current = serverVersion;
        sessionStorage.setItem('omega_client_version', serverVersion);
        return;
      }

      // Version différente détectée !
      if (serverVersion !== currentVersionRef.current) {
        console.log(`[AutoUpdate] Nouvelle version détectée : ${serverVersion} (actuelle: ${currentVersionRef.current})`);
        sessionStorage.setItem('omega_client_version', serverVersion);
        currentVersionRef.current = serverVersion;
        await executeAutoReload();
      }
    } catch {
      // En cas de coupure réseau temporaire, ignorer silencieusement
    }
  };

  // 1. Initialisation et surveillance périodique
  useEffect(() => {
    // Récupérer la version déjà mémorisée dans la session si existante
    const saved = sessionStorage.getItem('omega_client_version');
    if (saved) {
      currentVersionRef.current = saved;
    }

    // Première vérification
    checkForNewVersion();

    // Heartbeat périodique (toutes les 40 secondes)
    const intervalId = setInterval(() => {
      checkForNewVersion();
    }, 40000);

    // Retour au premier plan (smartphone déverrouillé, onglet réactivé)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForNewVersion();
      }
    };

    // Focus sur la fenêtre
    const handleFocus = () => {
      checkForNewVersion();
    };

    // Retour de la connexion internet
    const handleOnline = () => {
      checkForNewVersion();
    };

    // Réception d'un message du Service Worker annonçant une mise à jour
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === 'SW_ACTIVATED' || event.data.type === 'NEW_VERSION')) {
        console.log('[AutoUpdate] Signal Service Worker reçu, actualisation automatique...');
        executeAutoReload();
      }
    };

    // Détection de fin de saisie si un rechargement était en attente
    const handleBlur = () => {
      if (pendingReloadRef.current && !isUserTyping()) {
        pendingReloadRef.current = false;
        setTimeout(() => {
          if (!isUserTyping()) {
            executeAutoReload();
          }
        }, 1500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    document.addEventListener('focusout', handleBlur);

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('focusout', handleBlur);
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  // 2. Vérification lors de chaque navigation entre pages
  useEffect(() => {
    checkForNewVersion();
  }, [pathname]);

  return null;
};

