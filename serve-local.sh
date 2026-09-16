#!/bin/sh
cd "$(dirname "$0")" || exit 1
node build.js --preview || exit 1
node scripts/serve.js 8000 --preview
