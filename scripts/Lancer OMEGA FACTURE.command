#!/bin/bash
# ===================================================================
# Raccourci Bureau - OMEGA FACTURE
# Lance le serveur Next.js (avec actualisation en direct)
# et ouvre l'application dans le navigateur
# ===================================================================

PROJECT_DIR="/Users/MAC/Desktop/OMEGA FACTURE"
cd "$PROJECT_DIR" || exit 1

export PATH="/Users/MAC/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export PORT=3000

echo ""
echo "=================================================================="
echo "   🧾 OMEGA FACTURE — Suite de Facturation & Devis UEMOA"
echo "=================================================================="
echo ""

# 1. Vérifier si le serveur répond déjà sur le port 3000
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "308" ]; then
    echo "✓ Le serveur OMEGA FACTURE est DÉJÀ EN LIGNE sur http://localhost:3000"
    echo "✓ Ouverture dans votre navigateur..."
    open "http://localhost:3000"
    sleep 2
    # Fermer cette fenêtre secondaire car le serveur tourne déjà ailleurs
    osascript -e 'tell application "Terminal" to close front window' 2>/dev/null || true
    exit 0
fi

# 2. Nettoyer les processus orphelins sur le port 3000
EXISTING_PID=$(lsof -ti:3000 -sTCP:LISTEN 2>/dev/null)
if [ -n "$EXISTING_PID" ]; then
    echo "• Libération du port 3000 (PID: $EXISTING_PID)..."
    kill -9 $EXISTING_PID 2>/dev/null || true
    sleep 1
fi

# Nettoyer d'anciens processus PM2 en boucle s'il y en a
which pm2 >/dev/null 2>&1 && pm2 delete omega-facture 2>/dev/null || true

# 3. Ouvrir le navigateur automatiquement dès que le serveur est prêt
(
    MAX_TRIES=30
    COUNT=0
    while [ $COUNT -lt $MAX_TRIES ]; do
        sleep 1
        CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
        if [ "$CODE" = "200" ] || [ "$CODE" = "307" ] || [ "$CODE" = "308" ]; then
            echo ""
            echo "🚀 [OK] Application prête ! Ouverture de http://localhost:3000..."
            open "http://localhost:3000"
            break
        fi
        COUNT=$((COUNT + 1))
    done
) &

echo "• Démarrage du serveur Next.js en mode réactif (Fast Refresh)..."
echo "• URL de l'application : http://localhost:3000"
echo ""
echo "💡 CONSEIL : Laissez cette fenêtre ouverte pendant que vous utilisez OMEGA FACTURE."
echo "💡 Pour arrêter le serveur : appuyez sur Ctrl + C dans cette fenêtre."
echo "=================================================================="
echo ""

# Nettoyage préventif du cache pour garantir l'absence de conflits de modules
rm -rf .next/cache 2>/dev/null || true

# 4. Lancement direct de Next.js (Fast Refresh activé, les modifications s'affichent instantanément)
npm run dev
