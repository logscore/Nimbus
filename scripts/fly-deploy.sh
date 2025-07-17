#!/bin/bash

# This script is shared between apps/server and apps/web

# Color Constants
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Helper Functions
error_exit() {
    echo -e "${RED}$1${NC}"
    exit 1
}

linkify() {
  local url="$1"
  local label="${2:-$1}"
  printf '\e]8;;%s\a%s\e]8;;\a\n' "$url" "$label"
}

print_vars() {
    echo -e "${CYAN}Deployment Variables:${NC}"
    echo "APP_DIR_PATH: $APP_DIR_PATH"
    echo "APP_NAME: $APP_NAME"
    echo "PLATFORM: $PLATFORM"
    echo "REGISTRY: $REGISTRY"
    echo "TAG: $TAG"
    echo "APP_PORT: $APP_PORT"
    echo ""
}

check_env_var() {
    [ -z "${!1}" ] && MISSING_ENV_VARS+=("$1")
}

remove_old_images() {
    local images
    images=$(docker images | grep "$DOCKER_IMAGE_NAME" || true)

    local count
    # wc -l counts the number of lines, awk '{print $1}' gets the first column
    if [[ -z "$images" ]]; then
        count=0
    else
        count=$(echo "$images" | wc -l | awk '{print $1}')
    fi

    if [ "$count" -gt 1 ]; then
        echo -e "${YELLOW}WARNING: More than one docker image found for ${DOCKER_IMAGE_NAME}${NC}"
        echo "$images"
        exit 1
    elif [ "$count" -eq 1 ]; then
        echo -e "${YELLOW}Removing old docker image${NC}"
        echo "$images" | awk '{print $3}' | xargs docker rmi
        echo ""
    else
        echo -e "${GREEN}No previous docker image found. Proceeding...${NC}"
        echo ""
    fi
}

ensure_fly_config() {
    if ! flyctl apps list | awk '{print $1}' | grep -q -x "$APP_NAME"; then
        echo -e "${RED}App $APP_NAME does not exist on Fly.${NC}"
        echo "Docs: see uasge by running: fly launch --help or visit $(linkify "https://fly.io/docs/launch/create/")"
        echo "Recommended: fly launch --no-deploy --name $APP_NAME --internal-port $APP_PORT --vm-cpu-kind shared --vm-cpus 1 --vm-memory 256"
        echo -e "${YELLOW}Note: Copy the existing fly.toml configuration then say yes to modifying it.${NC}"
        echo -e "${YELLOW}Note: Don't generate .dockerignore from .gitignore—it may break Docker builds.${NC}"
        exit 1
    fi

    if [ ! -f "fly.toml" ]; then
        echo -e "${YELLOW}fly.toml missing. Attempting to download config...${NC}"
        echo "Docs: visit $(linkify "https://fly.io/docs/flyctl/config-save/")"
        flyctl config save --app "$APP_NAME"
        echo ""
    fi
}

# Input & Validation
APP_DIR_NAME="$1"
[ "$APP_DIR_NAME" != "server" ] && [ "$APP_DIR_NAME" != "web" ] && \
    error_exit "Usage: $0 <server|web>"

APP_DIR_PATH="${PWD}"
DEPLOY_DOCKER_COMPOSE_FILE_PATH="${PWD}/../../docker-compose.deploy.yml"
TAG=$(jq -r '.version' package.json)

export APP_DIR_PATH TAG

source .env

MISSING_ENV_VARS=()
check_env_var "PLATFORM"
check_env_var "REGISTRY"

if [ "$APP_DIR_NAME" == "server" ]; then
    check_env_var "SERVER_APP_NAME"
    check_env_var "SERVER_PORT"
    APP_NAME="$SERVER_APP_NAME"
    APP_PORT="$SERVER_PORT"
elif [ "$APP_DIR_NAME" == "web" ]; then
    check_env_var "WEB_APP_NAME"
    check_env_var "WEB_PORT"
    APP_NAME="$WEB_APP_NAME"
    APP_PORT="$WEB_PORT"
fi

export APP_NAME APP_PORT

if [ "${#MISSING_ENV_VARS[@]}" -gt 0 ]; then
    # sed is used to add commas between the missing environment variables
    error_exit "Missing environment variables: $(echo "${MISSING_ENV_VARS[*]}" | sed 's/ /, /g')"
fi

# Main Logic

DOCKER_IMAGE_NAME="${REGISTRY}/${APP_NAME}"

echo -e "${CYAN}Beginning deployment for $APP_NAME${NC}"
echo ""

print_vars
ensure_fly_config

# Exit on error after this point
set -e

remove_old_images

echo -e "${CYAN}Building Docker image${NC}"
docker compose -f "$DEPLOY_DOCKER_COMPOSE_FILE_PATH" build
echo ""

echo -e "${CYAN}Pushing Docker image${NC}"
# https://docs.docker.com/engine/reference/commandline/push/
# https://fly.io/docs/blueprints/using-the-fly-docker-registry/
docker push "${DOCKER_IMAGE_NAME}:${TAG}"
echo ""

echo -e "${CYAN}Deploying to Fly${NC}"
# https://fly.io/docs/launch/deploy/
# https://fly.io/docs/apps/app-availability/#redundancy-by-default-on-first-deploy
flyctl deploy --ha=false --app "$APP_NAME" --image "${DOCKER_IMAGE_NAME}:${TAG}"
echo ""

echo -e "${GREEN}Deployment complete!${NC}"
