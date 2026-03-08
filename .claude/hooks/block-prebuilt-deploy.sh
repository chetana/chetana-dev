#!/bin/bash
# Block 'vercel deploy --prod --prebuilt' — causes 500 on all auth endpoints
# because local node_modules for external packages are not uploaded to Vercel.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -q "vercel deploy" && echo "$COMMAND" | grep -q "\-\-prebuilt"; then
  echo "❌ BLOQUÉ : 'vercel deploy --prebuilt' est interdit sur ce projet." >&2
  echo "   Les node_modules des packages externes (google-auth-library, @google-cloud/storage)" >&2
  echo "   ne sont pas uploadés correctement → 500 sur tous les endpoints auth." >&2
  echo "   Utilise à la place : npx vercel deploy --prod" >&2
  exit 2
fi

exit 0
