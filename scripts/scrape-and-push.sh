#!/bin/bash
cd /home/alan/Documents/gcc-missile-tracker
npm run scrape

if [[ -n $(git status --porcelain public/) ]]; then
  git add public/*.json
  git commit -m "data: update $(date +%Y-%m-%d-%H%M)"
  git push origin main
  echo "Pushed updates"
else
  echo "No changes"
fi
