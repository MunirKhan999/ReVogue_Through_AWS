# ReVogue AWS Infrastructure

Full stack: **VPC**, **RDS**, **EC2**, **API Gateway**, **Cognito**, **S3**, **CloudFront**, **IAM (GitHub OIDC)**, plus **GitHub Actions** CI/CD.

See [PROJECT_RESOURCES.md](./PROJECT_RESOURCES.md) for a **full inventory** of every AWS resource, Terraform, GitHub Actions, and what is not used (e.g. Docker).  
See [ARCHITECTURE.md](./ARCHITECTURE.md) for the coordinated diagram.  
See [../../.github/CICD.md](../../.github/CICD.md) for GitHub secrets.

## Quick start

```bash
cd Backend/infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit: db_password, github_repository, ec2_key_name, ec2_ssh_cidr_blocks

terraform init
terraform apply

terraform output deployment_summary
terraform output github_secrets_checklist
```

### Apply outputs

```bash
# Frontend build
terraform output -raw frontend_env_snippet > ../../Frontend/revogue-frontend/.env.production.example.generated

# Backend EC2
terraform output -raw backend_env_snippet
# Copy to Backend/.env.production (set DB_PASSWORD from tfvars)

# Migrations
cd ../../revogue-backend && npm run db:migrate

# GitHub: set secrets from terraform output github_secrets_checklist
```

### Deploy

```bash
# Push to main → GitHub Actions deploy.yml
# (recommended) GitHub Actions handles backend and frontend deploys automatically.
# Or locally if you need a manual override:
cd Backend/revogue-backend && npm run deploy:ec2
cd Frontend && npm run deploy
```

## Components

| Service | Purpose |
|---------|---------|
| **VPC** | Default or custom VPC; subnets for EC2/RDS |
| **RDS** | PostgreSQL (private, EC2-only access) |
| **EC2** | NestJS API + PM2 + Elastic IP |
| **API Gateway** | Public HTTPS API (`NEXT_PUBLIC_API_URL`) |
| **Cognito** | Auth + `custom:role` (buyer/seller) |
| **S3 + CloudFront** | Static Next.js frontend |
| **IAM** | EC2 SSM role; GitHub OIDC deploy role for S3/CF |

## Variables (`terraform.tfvars`)

| Variable | Description |
|----------|-------------|
| `db_password` | RDS master password |
| `github_repository` | `owner/repo` for OIDC |
| `ec2_key_name` | SSH key pair name |
| `ec2_ssh_cidr_blocks` | Your IP for SSH |
| `enable_github_oidc` | `true` for GitHub Actions OIDC |

## Tear down

```bash
terraform destroy
```

Empty the S3 bucket first if destroy fails.
