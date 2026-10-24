#!/bin/bash
# ===================================================================
# OMEGA FACTURE - Redémarrer le service PM2
# ===================================================================

export PATH="/Users/MAC/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo "Redémarrage d'OMEGA FACTURE..."
cd "/Users/MAC/Desktop/OMEGA FACTURE" || exit 1
pm2 restart omega-facture 2>/dev/null || pm2 start npm --name "omega-facture" -- start
pm2 save
sleep 1

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$DIR/status-service.sh"
