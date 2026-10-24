#!/bin/bash
# ===================================================================
# OMEGA FACTURE - État du service
# ===================================================================

echo "=== État du Service OMEGA FACTURE ==="

# Vérification Login Item macOS
LOGIN_ITEM=$(osascript -e 'tell application "System Events" to get name of every login item whose name is "OMEGA FACTURE AutoLauncher"' 2>/dev/null)
if [ -n "$LOGIN_ITEM" ]; then
    echo "✓ Démarrage automatique au boot du Mac : ACTIF (Login Item '$LOGIN_ITEM')"
else
    echo "! Démarrage automatique : NON CONFIGURÉ dans les Login Items"
fi

PID=$(lsof -ti:3000 2>/dev/null)
if [ -n "$PID" ]; then
    echo "✓ Serveur EN LIGNE (PID: $PID sur le port 3000)"
    echo "✓ Lien actif : http://localhost:3000"
    
    # Test réponse HTTP
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✓ Réponse HTTP : 200 OK (Application réactive)"
    else
        echo "! Réponse HTTP : $HTTP_CODE"
    fi
else
    echo "✗ Aucun processus n'écoute sur le port 3000"
fi

LOG_FILE="/Users/MAC/Desktop/OMEGA FACTURE/logs/server.log"
if [ -f "$LOG_FILE" ]; then
    echo ""
    echo "--- 5 Dernières lignes de log ---"
    tail -n 5 "$LOG_FILE"
fi
