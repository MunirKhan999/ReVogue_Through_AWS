# ReVogue AWS Infrastructure (RDS)

PostgreSQL on **Amazon RDS**, intended to pair with Cognito auth on the backend.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.5
- [AWS CLI](https://aws.amazon.com/cli/) configured (`aws configure`)
- IAM permissions for RDS, EC2 (VPC/security groups), and subnets

## Provision RDS

```bash
cd Backend/infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — set db_password and allowed_cidr_blocks if needed

terraform init
terraform plan
terraform apply
```

After apply, copy the connection values from the output:

```bash
terraform output backend_env_snippet
```

Paste into `Backend/.env` and set `DB_PASSWORD` to the value from `terraform.tfvars`.

## Run migrations on RDS

From the backend folder, with `DB_*` pointing at RDS:

```bash
cd Backend/revogue-backend
npm run db:migrate
```

Or manually with `psql`:

```bash
psql "postgresql://USER:PASS@HOST:5432/revogue?sslmode=require" -f migrations/001_initial_schema.sql
# ... repeat for 002, 003, 004, 005
```

## Backend environment

| Variable | Local | RDS |
|----------|-------|-----|
| `DB_HOST` | `localhost` | RDS endpoint from Terraform |
| `DB_PORT` | `5432` | `5432` |
| `DB_SSL` | `false` | `true` |
| `DB_SYNCHRONIZE` | (dev default on) | `false` |

**Production:** always set `DB_SYNCHRONIZE=false` and apply SQL migrations instead of TypeORM `synchronize`.

## Tear down

```bash
terraform destroy
```
