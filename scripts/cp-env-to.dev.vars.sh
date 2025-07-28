#!/bin/bash

# Script to copy environment files to their respective .dev.vars equivalents
# Usage: ./scripts/copy_env_files.sh

set -e  # Exit immediately if a command exits with a non-zero status

# Find all app directories in the apps folder
# APP_DIRS=$(find apps -maxdepth 1 -type d -not -name "apps" -not -name "*.*")
APP_DIRS="apps/server"

for dir in $APP_DIRS; do
  echo "Processing $dir..."

  # Handle .env -> .dev.vars
  if [ -f ".env" ]; then
    echo "  Copying .env to $dir/.dev.vars"
    cp ".env" "$dir/.dev.vars"
  fi

  # Handle .env.production -> .dev.vars.production
  if [ -f ".env.production" ]; then
    echo "  Copying .env.production to $dir/.dev.vars.production"
    cp ".env.production" "$dir/.dev.vars.production"
  fi

  # Handle .env.staging -> .dev.vars.staging
  if [ -f ".env.staging" ]; then
    echo "  Copying .env.staging to $dir/.dev.vars.staging"
    cp ".env.staging" "$dir/.dev.vars.staging"
  fi

  # Handle .env.preview -> .dev.vars.preview
  if [ -f ".env.preview" ]; then
    echo "  Copying .env.preview to $dir/.dev.vars.preview"
    cp ".env.preview" "$dir/.dev.vars.preview"
  fi
done

echo "Environment files copied successfully!"
