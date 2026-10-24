#!/bin/bash
# ===================================================================
# OMEGA FACTURE - Arrêter le service d'arrière-plan macOS
# ===================================================================

# Libérer le port 3000 si encore actif
PID=$(lsof -ti:3000 2>/dev/null)
if [ -n "$PID" ]; then
    kill -9 $PID 2>/dev/null || true
    echo "✓ Port 3000 libéré (PID $PID arrêté)."
else
    echo "Le port 3000 n'était pas utilisé."
fi

echo "Serveur OMEGA FACTURE arrêté."
