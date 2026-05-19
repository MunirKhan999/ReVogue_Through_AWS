# ReVogue AWS Infrastructure

Terraform for **RDS** (PostgreSQL), **S3 + CloudFront** (frontend), used with **Cognito** auth.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.5
- [AWS CLI](https://aws.amazon.com/cli/) configured (`aws configure`)
- Node.js 18+ (for frontend build/deploy)

---

## RDS (backend database)

```bash
cd Backend/infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit db_password, allowed_cidr_blocks

terraform init
terraform apply
terraform output backend_env_snippet
```

Paste into `Backend/.env`, then:

```bash
cd Backend/revogue-backend
npm run db:migrate
```

| Variable | Local | RDS |
|----------|-------|-----|
| `DB_SSL` | `false` | `true` |
| `DB_SYNCHRONIZE` | `true` (dev) | `false` |

---

## Frontend (S3 + CloudFront)

Terraform creates a private S3 bucket and CloudFront distribution with HTTPS.

```bash
cd Backend/infrastructure/terraform
terraform apply   # creates frontend + RDS resources
terraform output frontend_cloudfront_domain
terraform output frontend_s3_bucket
terraform output frontend_cloudfront_distribution_id
```

### Build & deploy

1. Copy production env for the static build:

```bash
cd Frontend/revogue-frontend
cp .env.production.example .env.production
# Set NEXT_PUBLIC_API_URL, Cognito IDs (your API Gateway or backend URL)
```

2. Set deploy targets (from terraform output):

```bash
# Windows PowerShell
$env:FRONTEND_S3_BUCKET = "revogue-frontend-123456789012"
$env:FRONTEND_CLOUDFRONT_DISTRIBUTION_ID = "E1234567890ABC"
```

3. Deploy:

```bash
cd Frontend
npm run deploy
```

This runs `next build` (static export to `revogue-frontend/out/`), `aws s3 sync`, and CloudFront invalidation.

### Custom domain (optional)

1. Request an ACM certificate in **us-east-1** for your domain.
2. Set in `terraform.tfvars`:

```hcl
frontend_domain_name         = "app.example.com"
frontend_acm_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT:certificate/..."
```

3. Point a Route 53 (or DNS) **CNAME** to the CloudFront domain name.

### Cognito redirect URLs

Add your CloudFront URL to the Cognito app client:

- Callback URL: `https://<cloudfront-domain>/`
- Sign-out URL: `https://<cloudfront-domain>/login`

Update backend CORS (`FRONTEND_URL` / `main.ts`) to include the CloudFront origin.

---

## Tear down

```bash
cd Backend/infrastructure/terraform
terraform destroy
```

Empty the S3 bucket first if `terraform destroy` fails on a non-empty bucket.
