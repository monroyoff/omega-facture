#!/bin/bash
# ===================================================================
# OMEGA FACTURE - Service de Démarrage Automatique macOS (LaunchAgent)
# Maintient le serveur Next.js actif en permanence sur http://localhost:3000
# ===================================================================

PROJECT_DIR="/Users/MAC/Desktop/OMEGA FACTURE"
cd "$PROJECT_DIR" || exit 1

# Exporter le PATH complet de l'utilisateur pour trouver node, npm, etc.
export PATH="/Users/MAC/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
export PORT=3000
export NODE_ENV=production

# Trouver le binaire node
NODE_BIN=$(which node 2>/dev/null || echo "/Users/MAC/.local/bin/node")

# Vérifier si le build de production existe, sinon le compiler
if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Premier démarrage : Compilation Next.js..."
    "$NODE_BIN" ./node_modules/next/dist/bin/next build
fi

# Libérer le port 3000 si un ancien processus orphelin traîne
EXISTING_PID=$(lsof -ti:3000 2>/dev/null)
if [ -n "$EXISTING_PID" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Port 3000 déjà utilisé par PID $EXISTING_PID, libération..."
    kill -9 $EXISTING_PID 2>/dev/null || true
    sleep 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Démarrage du serveur OMEGA FACTURE sur http://localhost:3000..."

# Exécuter Next.js en production (remplace le sous-processus pour que launchd gère directement Node)
exec "$NODE_BIN" ./node_modules/next/dist/bin/next start -p 3000
