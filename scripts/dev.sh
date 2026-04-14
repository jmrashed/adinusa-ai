#!/bin/bash
trap "kill 0" EXIT
(cd backend && npm run dev) &
(cd adinusa-ai && pnpm run watch) &
wait
