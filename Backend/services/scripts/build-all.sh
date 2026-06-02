#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:?Set AWS_ACCOUNT_ID}"
TAG="${IMAGE_TAG:-latest}"

SERVICES=(frontend gateway catalog cart order payment notification)

for svc in "${SERVICES[@]}"; do
  REPO="revogue-${svc}"
  IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO}:${TAG}"
  echo "Building ${svc} -> ${IMAGE}"
  docker build -f "${ROOT}/${svc}/Dockerfile" -t "${IMAGE}" "${ROOT}/${svc}"
  if [[ "${PUSH:-false}" == "true" ]]; then
    docker push "${IMAGE}"
  fi
done

echo "All images built."
