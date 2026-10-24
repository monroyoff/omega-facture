#!/bin/bash
# ===================================================================
# Raccourci Bureau - OMEGA FACTURE
# Vérifie l'état du serveur et ouvre l'application dans le navigateur
# ===================================================================

export PATH="/Users/MAC/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)

if [ "$HTTP_CODE" != "200" ]; then
    echo "Démarrage automatique d'OMEGA FACTURE via PM2..."
    pm2 resurrect 2>/dev/null || (cd "/Users/MAC/Desktop/OMEGA FACTURE" && pm2 start npm --name "omega-facture" -- start)
    sleep 2
fi

echo "Ouverture d'OMEGA FACTURE dans le navigateur..."
open "http://localhost:3000"

# Fermer la fenêtre de terminal
osascript -e 'tell application "Terminal" to close (every window whose name contains "Lancer OMEGA FACTURE")' 2>/dev/null || true
exit 0
