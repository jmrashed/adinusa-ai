#!/bin/bash
set -e
echo "Installing backend dependencies..."
cd backend && npm install
echo "Installing extension dependencies..."
cd ../adinusa-ai && pnpm install
echo "Done."
