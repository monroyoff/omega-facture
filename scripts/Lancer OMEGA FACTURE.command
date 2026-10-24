#!/bin/bash
# ===================================================================
# Raccourci Bureau - OMEGA FACTURE
# Vérifie l'état du serveur et ouvre l'application dans le navigateur
# ===================================================================

PROJECT_DIR="/Users/MAC/Desktop/OMEGA FACTURE"

# Vérifier si le serveur écoute déjà sur le port 3000
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)

if [ "$HTTP_CODE" != "200" ]; then
    echo "Démarrage du serveur OMEGA FACTURE en arrière-plan..."
    nohup /bin/bash "$PROJECT_DIR/scripts/start-service.sh" > "$PROJECT_DIR/logs/server.log" 2>&1 &
    sleep 2
fi

echo "Ouverture d'OMEGA FACTURE dans le navigateur..."
open "http://localhost:3000"

# Fermer automatiquement le terminal
osascript -e 'tell application "Terminal" to close (every window whose name contains "Lancer OMEGA FACTURE")' 2>/dev/null || true
exit 0
