#!/bin/bash
# Setup EAS project — gets or creates project, writes ID to app.json
set -e

echo "=== EAS Project Setup ==="

# Get Expo account name
ACCOUNT=$(eas whoami 2>/dev/null | grep -v "^$" | head -1 | tr -d '[:space:]')
echo "Account: $ACCOUNT"

if [ -z "$ACCOUNT" ]; then
  echo "ERROR: Could not get Expo account. Check EXPO_TOKEN."
  exit 1
fi

# Try to get existing project ID first
echo "Checking for existing project..."
EXISTING=$(curl -sf -X POST https://api.expo.dev/graphql \
  -H "Authorization: Bearer $EXPO_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"{ app { byFullName(fullName: \\\"@${ACCOUNT}/nculater\\\") { id } } }\"}" 2>/dev/null || echo '{}')
echo "Existing: $EXISTING"

PROJECT_ID=$(echo "$EXISTING" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    pid = d.get('data',{}).get('app',{}).get('byFullName',{})
    if pid and pid.get('id'):
        print(pid['id'])
except: pass
" 2>/dev/null || echo "")

# If not found, create it
if [ -z "$PROJECT_ID" ]; then
  echo "Creating new EAS project..."
  RESP=$(curl -sf -X POST https://api.expo.dev/graphql \
    -H "Authorization: Bearer $EXPO_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\":\"mutation { app { createApp(appInput: { accountName: \\\"${ACCOUNT}\\\", projectName: \\\"nculater\\\" }) { id } } }\"}" 2>/dev/null || echo '{}')
  echo "Create response: $RESP"
  PROJECT_ID=$(echo "$RESP" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('data',{}).get('app',{}).get('createApp',{}).get('id',''))
except: pass
" 2>/dev/null || echo "")
fi

echo "Project ID: $PROJECT_ID"

# Write to app.json
if [ -n "$PROJECT_ID" ]; then
  python3 - <<PYEOF
import json
with open('app.json') as f:
    d = json.load(f)
d['expo'].setdefault('extra', {}).setdefault('eas', {})['projectId'] = '$PROJECT_ID'
with open('app.json', 'w') as f:
    json.dump(d, f, indent=2)
print('app.json updated with projectId:', '$PROJECT_ID')
PYEOF
  echo "=== Setup complete ==="
else
  echo "WARNING: No project ID found. Build may fail."
fi
