'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * AutoUpdateWatcher
 * 
 * Système d'auto-mise à jour transparente et autonome.
 * Garantit que TOUTE modification, correction de bug ou déploiement
 * actuel ou futur est pris en compte instantanément sur Web, Mobile (Safari/Chrome),
 * PWA et application native Android SANS AUCUNE ACTION requise de la part de l'utilisateur
 * (aucun rafraîchissement manuel, aucun vidage de cache nécessaire).
 */

// Version injectée à la compilation dans le bundle client Next.js
const COMPILED_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '';
const COMPILED_BUILD_TIME = Number(process.env.NEXT_PUBLIC_BUILD_TIME || 0);

export const AutoUpdateWatcher: React.FC = () => {
  const pathname = usePathname();
  const currentVersionRef = useRef<string | null>(null);
  const isReloadingRef = useRef<boolean>(false);
  const pendingReloadRef = useRef<boolean>(false);
  const lastCheckTimestampRef = useRef<number>(0);

  // Vérifie si l'utilisateur est activement en train de taper dans un formulaire
  const isUserTyping = (): boolean => {
    if (typeof document === 'undefined') return false;
    const activeEl = document.activeElement;
    if (!activeEl) return false;
    const tag = activeEl.tagName.toLowerCase();
    const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';
    const isEditable = activeEl.getAttribute('contenteditable') === 'true';
    return isInput || isEditable;
  };

  // Exécute la mise à jour et la purge intégrale des caches
  const executeAutoReload = async (reason: string = 'new_version') => {
    if (isReloadingRef.current) return;

    // Protection ergonomique : si l'utilisateur est en cours de saisie, reporter à la fin
    if (isUserTyping()) {
      console.log(`[AutoUpdate] Mise à jour (${reason}) en attente : utilisateur en cours de saisie.`);
      pendingReloadRef.current = true;
      return;
    }

    isReloadingRef.current = true;
    console.log(`[AutoUpdate] Déclenchement de l'auto-mise à jour transparente (${reason})...`);

    try {
      // 1. Purge complète de tous les caches CacheStorage (Service Worker)
      if (typeof window !== 'undefined' && 'caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }

      // 2. Déclenchement de la mise à jour des Service Workers actifs
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.update();
        }
      }
    } catch (e) {
      console.warn('[AutoUpdate] Nettoyage partiel du cache :', e);
    }

    // 3. Rechargement immédiat et sans cache du document
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Interroge le serveur pour vérifier l'existence d'une nouvelle version
  const checkForNewVersion = async () => {
    if (isReloadingRef.current) return;
    if (typeof window === 'undefined') return;

    // Éviter les requêtes trop rapprochées (< 3s)
    const now = Date.now();
    if (now - lastCheckTimestampRef.current < 3000) return;
    lastCheckTimestampRef.current = now;

    try {
      const response = await fetch(`/version.json?_t=${now}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      const serverVersion: string = data?.version;
      const serverBuildTime: number = Number(data?.buildTime || 0);

      if (!serverVersion) return;

      // 1. Comparaison avec la version compilée dans le bundle JavaScript actif
      const isBundleOutdated = Boolean(
        COMPILED_VERSION &&
        COMPILED_VERSION !== 'dev' &&
        serverVersion !== COMPILED_VERSION
      );

      const isBuildTimeOutdated = Boolean(
        COMPILED_BUILD_TIME > 0 &&
        serverBuildTime > 0 &&
        serverBuildTime > COMPILED_BUILD_TIME + 2000
      );

      // 2. Comparaison avec la session en cours
      const isSessionOutdated = Boolean(
        currentVersionRef.current &&
        currentVersionRef.current !== serverVersion
      );

      if (isBundleOutdated || isBuildTimeOutdated || isSessionOutdated) {
        console.log(
          `[AutoUpdate] Nouvelle version détectée sur le serveur : ${serverVersion} ` +
          `(bundle: ${COMPILED_VERSION}, active: ${currentVersionRef.current})`
        );
        sessionStorage.setItem('omega_client_version', serverVersion);
        currentVersionRef.current = serverVersion;
        await executeAutoReload('version_mismatch');
        return;
      }

      // Initialisation de la version de référence pour la session
      if (!currentVersionRef.current) {
        currentVersionRef.current = serverVersion;
        sessionStorage.setItem('omega_client_version', serverVersion);
      }
    } catch {
      // Ignorer silencieusement si coupure internet temporaire
    }
  };

  useEffect(() => {
    // 1. Restauration de la session si existante
    const saved = sessionStorage.getItem('omega_client_version');
    if (saved) {
      currentVersionRef.current = saved;
    }

    // 2. Vérification immédiate au montage
    checkForNewVersion();

    // 3. Heartbeat régulier toutes les 25 secondes (très léger ~100 octets via CDN)
    const intervalId = setInterval(() => {
      checkForNewVersion();
    }, 25000);

    // 4. Détection du retour au premier plan (smartphone déverrouillé, onglet réactivé)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForNewVersion();
      }
    };

    // 5. Focus sur la fenêtre
    const handleFocus = () => {
      checkForNewVersion();
    };

    // 6. Rétablissement de la connexion réseau
    const handleOnline = () => {
      checkForNewVersion();
    };

    // 7. Message du Service Worker (nouvelle version activée)
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === 'SW_ACTIVATED' || event.data.type === 'NEW_VERSION')) {
        console.log('[AutoUpdate] Signal SW reçu, application de la mise à jour...');
        executeAutoReload('service_worker_activation');
      }
    };

    // 8. Détection de fin de saisie si une mise à jour était différée
    const handleFocusOut = () => {
      if (pendingReloadRef.current) {
        setTimeout(() => {
          if (!isUserTyping()) {
            pendingReloadRef.current = false;
            executeAutoReload('delayed_after_typing');
          }
        }, 1200);
      }
    };

    // 9. Auto-récupération instantanée en cas d'erreur de chargement de chunk Next.js
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event?.message || '';
      const isChunkError =
        msg.includes('Loading chunk') ||
        msg.includes('ChunkLoadError') ||
        msg.includes('Failed to fetch dynamically imported module');

      if (isChunkError) {
        console.warn('[AutoUpdate] Erreur de chunk détectée suite à un déploiement, actualisation...');
        executeAutoReload('chunk_error_recovery');
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event?.reason || '');
      if (
        reason.includes('Loading chunk') ||
        reason.includes('ChunkLoadError') ||
        reason.includes('Failed to fetch dynamically imported module')
      ) {
        console.warn('[AutoUpdate] Rejet de promesse de chunk détecté, actualisation...');
        executeAutoReload('unhandled_chunk_recovery');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    document.addEventListener('focusout', handleFocusOut);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  // 10. Vérification à chaque navigation de route dans l'application
  useEffect(() => {
    checkForNewVersion();
  }, [pathname]);

  return null;
};
