#!/bin/bash
# ===================================================================
# OMEGA FACTURE - État du serveur
# ===================================================================

export PATH="/Users/MAC/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
PROJECT_DIR="/Users/MAC/Desktop/OMEGA FACTURE"

echo "=== État du Serveur OMEGA FACTURE ==="

PORT_PID=$(lsof -ti:3000 2>/dev/null)
if [ -n "$PORT_PID" ]; then
    echo "✓ Processus actif sur le port 3000 (PID: $PORT_PID)"
else
    echo "✗ Aucun processus n'écoute sur le port 3000"
fi

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "308" ]; then
    echo "✓ Serveur EN LIGNE (HTTP $HTTP_CODE) sur http://localhost:3000"
else
    echo "✗ Serveur INACCESSIBLE (Code HTTP: $HTTP_CODE)"
fi
