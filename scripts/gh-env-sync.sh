#!/bin/bash

# Exit on error
set -e

# Function to display help
show_help() {
    echo "Usage: $0 --env|-e {staging|production} [--github-env ENV] [--include-disabled]"
    echo "Sync environment variables to GitHub secrets"
    echo ""
    echo "Options:"
    echo "  -e, --env ENVIRONMENT     Source environment file to sync from (staging or production)"
    echo "  -g, --github-env ENV     GitHub environment to sync to (defaults to --env value)"
    echo "  -d, --include-disabled   Include disabled environment variables from .env.${ENV}.disabled"
    echo "  -h, --help               Show this help message and exit"
}

# Parse command line arguments
INCLUDE_DISABLED=false

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -e|--env)
            ENV="$2"
            shift # past argument
            shift # past value
            ;;
        -g|--github-env)
            GITHUB_ENV="$2"
            shift # past argument
            shift # past value
            ;;
        -d|--include-disabled)
            INCLUDE_DISABLED=true
            shift # past argument
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Default GitHub environment to ENV if not specified
GITHUB_ENV=${GITHUB_ENV:-$ENV}

# Validate environment
if [[ -z "$ENV" ]]; then
    echo "Error: No environment specified"
    show_help
    exit 1
fi

if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
    echo "Error: Environment must be either 'staging' or 'production'"
    exit 1
fi

ENV_FILE="./.env.${ENV}"
if [ "$INCLUDE_DISABLED" = true ]; then
    ENV_FILE="./.env.${ENV}.disabled"
fi

# Check if environment file exists
if [[ ! -f "$ENV_FILE" ]]; then
    echo "Error: Environment file $ENV_FILE not found"
    exit 1
fi

echo "Syncing environment variables from $ENV_FILE to GitHub environment '$GITHUB_ENV'..."
gh secret set --env "$GITHUB_ENV" --env-file "$ENV_FILE"

echo "✅ Successfully synced $ENV environment secrets to GitHub environment '$GITHUB_ENV'"
