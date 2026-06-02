# CI/CD with GitHub Actions

Coordinated with Terraform in `Backend/infrastructure/terraform/`.

## Architecture

```
Browser
  ├─► CloudFront ─► S3 (Next.js static)
  ├─► API Gateway (HTTPS) ─► EC2:3001 (NestJS + PM2)
  └─► Cognito (sign-in) ─► JWT ─► API Gateway ─► EC2

EC2 ─► RDS PostgreSQL (private, same VPC)
GitHub Actions (OIDC IAM) ─► S3 + CloudFront deploy
GitHub Actions (SSH) ─► EC2 deploy
GitHub Actions (OIDC) ─► ECR + ECS (optional, `ENABLE_ECS_DEPLOY=true`)
```

When `enable_ecs_infrastructure = true` in Terraform:

```
API Gateway ─► VPC Link ─► Public ALB ─► gateway:8080
                                    └─► Internal ALB ─► catalog | cart | order | ...
ECS tasks ◄─► Cloud Map (commerce.local) ◄─► ElastiCache Redis
ECS tasks ─► RDS (cross-VPC SG rule; migrate RDS to ECS VPC for production)
```

See [MIGRATION.md](../Backend/infrastructure/MIGRATION.md).

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [ci.yml](workflows/ci.yml) | PR / `develop` push / reusable | Build backend & frontend, validate Terraform |
| [deploy.yml](workflows/deploy.yml) | `main` push / manual | Deploy EC2 + S3/CloudFront after CI |
| [deploy-ecs.yml](workflows/deploy-ecs.yml) | `main` (services path) / manual | Build → ECR → ECS (when enabled) |

## Setup (one-time)

### 1. Terraform

```bash
cd Backend/infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Set: db_password, github_repository, ec2_key_name, ec2_ssh_cidr_blocks

terraform init
terraform apply
terraform output deployment_summary
terraform output github_secrets_checklist
```

### 2. GitHub repository

**Settings → Environments → `production`** (optional approval).

**Settings → Secrets and variables → Actions:**

| Secret | Source (`terraform output`) |
|--------|-----------------------------|
| `AWS_DEPLOY_ROLE_ARN` | `github_actions_role_arn` |
| `AWS_REGION` | `aws_region` variable |
| `EC2_HOST` | `ec2_elastic_ip` |
| `EC2_SSH_PRIVATE_KEY` | Your `.pem` key contents |
| `FRONTEND_S3_BUCKET` | `frontend_s3_bucket` |
| `FRONTEND_CLOUDFRONT_DISTRIBUTION_ID` | `frontend_cloudfront_distribution_id` |
| `NEXT_PUBLIC_API_URL` | `backend_api_url` (API Gateway URL) |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | `cognito_user_pool_id` |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | `cognito_client_id` |
| `FRONTEND_URL` | `frontend_url` |
| `DB_HOST` | `rds_endpoint` |
| `DB_USERNAME` | from tfvars |
| `DB_PASSWORD` | from tfvars |
| `DB_NAME` | from tfvars |
| `COGNITO_USER_POOL_ID` | `cognito_user_pool_id` |
| `COGNITO_CLIENT_ID` | `cognito_client_id` |

OIDC replaces long-lived `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` for frontend deploy.

### 3. Run migrations

```bash
# Use RDS endpoint from terraform in Backend/.env
cd Backend/revogue-backend
npm run db:migrate
```

## Manual deploy

```bash
# Backend → EC2
export EC2_HOST=$(terraform output -raw ec2_elastic_ip)
export EC2_KEY_PATH=~/.ssh/revogue-key.pem
cd Backend/revogue-backend && npm run deploy:ec2

# Frontend → S3
export FRONTEND_S3_BUCKET=$(terraform output -raw frontend_s3_bucket)
export FRONTEND_CLOUDFRONT_DISTRIBUTION_ID=$(terraform output -raw frontend_cloudfront_distribution_id)
# Build with .env.production from: terraform output frontend_env_snippet
cd Frontend && npm run deploy
```
