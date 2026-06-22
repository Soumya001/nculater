#!/bin/bash
# Setup EAS project — creates/links project and writes ID to app.json
set -e

echo "=== EAS Project Setup ==="
eas whoami
echo "Initialising EAS project (creates if new, links if existing)..."
eas init --non-interactive
echo "=== app.json after init ==="
cat app.json
echo "=== Setup complete ==="
