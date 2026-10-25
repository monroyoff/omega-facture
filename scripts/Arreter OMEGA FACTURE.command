#!/bin/bash
# ===================================================================
# Raccourci Bureau - Arrêter OMEGA FACTURE
# ===================================================================

PROJECT_DIR="/Users/MAC/Desktop/OMEGA FACTURE"
cd "$PROJECT_DIR" || exit 1

export PATH="/Users/MAC/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo ""
echo "=================================================================="
echo "   🛑 ARRÊT D'OMEGA FACTURE"
echo "=================================================================="
echo ""

bash "$PROJECT_DIR/scripts/stop-service.sh"

sleep 1
osascript -e 'tell application "Terminal" to close front window' 2>/dev/null || true
exit 0
