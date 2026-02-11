#!/usr/bin/env bash
set -euo pipefail

TAR_PATH="${1:-./blog-standalone_local.tar}"
IMAGE_TAG="${IMAGE_TAG:-blog-standalone:local}"
CONTAINER_NAME="${CONTAINER_NAME:-blog}"
ENV_FILE="${ENV_FILE:-/opt/blog/.env}"
NETWORK_NAME="${NETWORK_NAME:-nginx-net}"

echo "Loading Blog image from ${TAR_PATH}..."
docker load -i "${TAR_PATH}"

echo "Ensuring network ${NETWORK_NAME} exists..."
docker network inspect "${NETWORK_NAME}" >/dev/null 2>&1 || docker network create "${NETWORK_NAME}"

echo "Stopping old Blog container (if any)..."
docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true
docker rm "${CONTAINER_NAME}" >/dev/null 2>&1 || true

echo "Starting Blog container..."
docker run -d --name "${CONTAINER_NAME}" \
  --network "${NETWORK_NAME}" \
  --env-file "${ENV_FILE}" \
  "${IMAGE_TAG}"

echo "Blog deployed."
