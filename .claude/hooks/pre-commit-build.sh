#!/bin/bash
# Block git commits if the Nuxt build fails

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Only intercept git commit commands
if ! echo "$COMMAND" | grep -q "git commit"; then
  exit 0
fi

echo "Running build check before commit..." >&2

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Nuxt ne charge pas .env.production automatiquement — injecter GOOGLE_CLIENT_ID
if [ -f ".env.production" ]; then
  export GOOGLE_CLIENT_ID=$(grep 'GOOGLE_CLIENT_ID=' .env.production | sed 's/GOOGLE_CLIENT_ID="\(.*\)"/\1/')
fi

if ! npm run build > /dev/null 2>&1; then
  echo "Build failed. Fix errors before committing." >&2
  exit 2
fi

echo "Build passed." >&2
exit 0
