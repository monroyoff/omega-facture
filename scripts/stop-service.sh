#!/bin/bash
# ===================================================================
# OMEGA FACTURE - Arrêter le serveur
# ===================================================================

export PATH="/Users/MAC/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
PROJECT_DIR="/Users/MAC/Desktop/OMEGA FACTURE"

echo "Arrêt d'OMEGA FACTURE..."

# 1. Arrêter via le fichier PID
if [ -f "$PROJECT_DIR/logs/omega-facture.pid" ]; then
    PID=$(cat "$PROJECT_DIR/logs/omega-facture.pid")
    kill -9 $PID 2>/dev/null || true
    rm -f "$PROJECT_DIR/logs/omega-facture.pid"
fi

# 2. Libérer tout processus écoutant sur le port 3000
PORT_PID=$(lsof -ti:3000 2>/dev/null)
if [ -n "$PORT_PID" ]; then
    kill -9 $PORT_PID 2>/dev/null || true
fi

# 3. Arrêter PM2 s'il y a un résidu
which pm2 >/dev/null 2>&1 && pm2 delete omega-facture 2>/dev/null || true

echo "✓ Application OMEGA FACTURE arrêtée avec succès."
