#!/bin/bash
# ===================================================================
# OMEGA FACTURE - Arrêter le service PM2
# ===================================================================

export PATH="/Users/MAC/.local/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

echo "Arrêt d'OMEGA FACTURE..."
pm2 stop omega-facture 2>/dev/null
echo "✓ Application arrêtée."
