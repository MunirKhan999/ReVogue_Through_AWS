# ReVogue microservices

NestJS stubs for ECS Fargate. Each service exposes `GET /health`.

| Service | Port | ECR repo |
|---------|------|----------|
| frontend | 3000 | revogue-frontend |
| gateway | 8080 | revogue-gateway |
| catalog | 3001 | revogue-catalog |
| cart | 3002 | revogue-cart |
| order | 3003 | revogue-order |
| payment | 3004 | revogue-payment |
| notification | 3005 | revogue-notification |

## Local build

```bash
cd Backend/services/scripts
export AWS_ACCOUNT_ID=123456789012
PUSH=true ./build-all.sh
```

## Docker

```bash
docker build -f gateway/Dockerfile -t revogue-gateway gateway/
```

Gateway proxies `/api/{service}/*` to `{service}.commerce.local` (Cloud Map DNS in ECS).
