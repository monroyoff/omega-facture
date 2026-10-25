#!/bin/bash
# ===================================================================
# OMEGA FACTURE - Redémarrer le serveur
# ===================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Redémarrage d'OMEGA FACTURE..."
"$DIR/stop-service.sh"
sleep 1
"$DIR/Lancer OMEGA FACTURE.command"
