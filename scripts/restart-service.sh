#!/bin/bash
# ===================================================================
# OMEGA FACTURE - Redémarrer le service
# ===================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Arrêt en cours..."
"$DIR/stop-service.sh"
sleep 1

echo "Démarrage en cours..."
osascript -e 'do shell script "nohup /bin/bash \"/Users/MAC/Desktop/OMEGA FACTURE/scripts/start-service.sh\" > \"/Users/MAC/Desktop/OMEGA FACTURE/logs/server.log\" 2>&1 &"'
sleep 2

"$DIR/status-service.sh"
