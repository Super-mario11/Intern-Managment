#!/usr/bin/env bash
# Bash helper to install Tailwind v3 and initialize config
set -e
cd "$(dirname "$0")/.."
echo "Running Tailwind setup (bash)..."
npm install
npm install -D tailwindcss@^3.4.7 postcss autoprefixer
npx tailwindcss init -p

echo "Tailwind setup complete. Run 'npm run dev' or 'npm start' to start the dev server."