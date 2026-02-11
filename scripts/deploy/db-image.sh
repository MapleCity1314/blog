#!/usr/bin/env bash
set -euo pipefail

TAR_PATH="${1:-./blog-db_local.tar}"
IMAGE_TAG="${IMAGE_TAG:-blog-db:local}"
CONTAINER_NAME="${CONTAINER_NAME:-blog-db}"
ENV_FILE="${ENV_FILE:-/opt/blog/.env.db}"
NETWORK_NAME="${NETWORK_NAME:-nginx-net}"
VOLUME_NAME="${VOLUME_NAME:-blog-pgdata}"

echo "Loading DB image from ${TAR_PATH}..."
docker load -i "${TAR_PATH}"

echo "Ensuring network ${NETWORK_NAME} exists..."
docker network inspect "${NETWORK_NAME}" >/dev/null 2>&1 || docker network create "${NETWORK_NAME}"

echo "Ensuring volume ${VOLUME_NAME} exists..."
docker volume inspect "${VOLUME_NAME}" >/dev/null 2>&1 || docker volume create "${VOLUME_NAME}"

echo "Stopping old DB container (if any)..."
docker stop "${CONTAINER_NAME}" >/dev/null 2>&1 || true
docker rm "${CONTAINER_NAME}" >/dev/null 2>&1 || true

echo "Starting DB container..."
docker run -d --name "${CONTAINER_NAME}" \
  --network "${NETWORK_NAME}" \
  --env-file "${ENV_FILE}" \
  -v "${VOLUME_NAME}:/var/lib/postgresql/data" \
  --health-cmd 'pg_isready -U "$${POSTGRES_USER:-postgres}" -d "$${POSTGRES_DB:-postgres}"' \
  --health-interval 10s \
  --health-timeout 5s \
  --health-retries 5 \
  "${IMAGE_TAG}"

echo "DB deployed. Initialization SQL runs automatically only on first boot of an empty volume."
