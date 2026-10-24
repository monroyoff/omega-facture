#!/bin/bash
# ===================================================================
# OMEGA FACTURE - État du service
# ===================================================================

export PATH="/Users/MAC/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo "=== État du Service OMEGA FACTURE (PM2) ==="
pm2 status omega-facture
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ Serveur EN LIGNE (200 OK) sur http://localhost:3000"
else
    echo "✗ Serveur HORS LIGNE (code HTTP: $HTTP_CODE)"
fi
