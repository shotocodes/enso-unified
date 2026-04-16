#!/bin/bash
export PATH="$HOME/.nvm/versions/node/v20.14.0/bin:$PATH"
cd "$(dirname "$0")"
exec npx next dev --turbopack
