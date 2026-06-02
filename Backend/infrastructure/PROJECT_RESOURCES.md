---

## Implementation Plan: Next Steps for Missing Resources

For each missing resource, here’s what to implement next to achieve a fully linked, production-ready ECS microservices stack:

| Resource                | Terraform Resource(s)                | File(s) to Update                | Integration/Notes |
|-------------------------|--------------------------------------|----------------------------------|-------------------|
| **Internet Gateway**    | `aws_internet_gateway`               | `networking.tf` or `main.tf`     | Attach to VPC; required for public subnets |
| **NAT Gateway**         | `aws_nat_gateway`, `aws_eip`         | `networking.tf` or `main.tf`     | Needed for private subnets to access internet |
| **Public Subnets**      | `aws_subnet` (public)                | `networking.tf` or `main.tf`     | Tag as public, map public IPs, 2 AZs |
| **Private Subnets**     | `aws_subnet` (private)               | `networking.tf` or `main.tf`     | No public IPs, 2 AZs |
| **Route Tables**        | `aws_route_table`, `aws_route_table_association`, `aws_route` | `networking.tf` or `main.tf` | Public: route 0.0.0.0/0 → IGW; Private: 0.0.0.0/0 → NAT GW |
| **Public ALB**          | `aws_lb`, `aws_lb_target_group`, `aws_lb_listener` | `alb.tf`                       | Expose gateway service to internet; link to ECS |
| **Internal ALB**        | `aws_lb` (internal), `aws_lb_target_group`, `aws_lb_listener` | `alb.tf`                       | For service-to-service traffic (optional) |
| **VPC Link (API GW→ALB)** | `aws_apigatewayv2_vpc_link`         | `api-gateway.tf`                 | Connect API Gateway to public ALB |
| **ElastiCache Redis**   | `aws_elasticache_subnet_group`, `aws_elasticache_cluster` | `elasticache.tf`               | For caching/session; place in private subnets |
| **CloudWatch Log Groups** | `aws_cloudwatch_log_group`           | `cloudwatch.tf` or per-service   | For ECS, ALB, API Gateway, etc. logging |
| **Cloud Map / Service Discovery** | `aws_service_discovery_private_dns_namespace`, `aws_service_discovery_service` | `cloudmap.tf`                  | Enable ECS service discovery |
| **ECS Task Definitions** | `aws_ecs_task_definition`             | `ecs.tf`                         | One per microservice; reference ECR images |
| **ECS Services**        | `aws_ecs_service`                     | `ecs.tf`                         | One per microservice; link to ALB target groups |
| **Security Groups for ALB/ECS/Redis** | `aws_security_group`         | `alb.tf`, `ecs.tf`, `elasticache.tf` | Define ingress/egress for each component |

**General Steps:**
1. Define networking (VPC, subnets, IGW, NAT, route tables) for public/private separation.
2. Add ALBs and link to ECS services via target groups.
3. Add ECS task definitions and ECS services for each microservice.
4. Add VPC Link for API Gateway to ALB.
5. Add ElastiCache, CloudWatch log groups, and Cloud Map as needed.
6. Update security groups for all new resources.
7. Test end-to-end: deploy, verify service discovery, ALB routing, API Gateway, and logging.

> **Tip:** Implement and test incrementally. After each major resource is added, run `terraform apply` and verify connectivity before proceeding.
# ReVogue — Project Resources Inventory

Everything used in this project today: **AWS services**, **infrastructure tools**, **application stack**, and what is **not** used (e.g. Docker).

All AWS resources below are created and managed by **Terraform** in `Backend/infrastructure/terraform/` unless noted.

---

## Summary table

| Category | Technology | Used? | Purpose |
|----------|------------|-------|---------|
| IaC | **Terraform** | ✅ Yes | Provisions all AWS resources |
| Containers | **Docker** | ❌ No | Not used; EC2 runs Node.js + PM2 directly |
| Compute | **Amazon EC2** | ✅ Yes | Hosts NestJS backend API |
| Database | **Amazon RDS** | ✅ Yes | PostgreSQL for app data |
| API | **Amazon API Gateway** | ✅ Yes | Public HTTPS entry to backend |
| Auth | **Amazon Cognito** | ✅ Yes | User sign-up / sign-in, JWT tokens |
| Storage | **Amazon S3** | ✅ Yes | Static Next.js frontend files |
| CDN | **Amazon CloudFront** | ✅ Yes | HTTPS CDN for S3 frontend |
| Network | **Amazon VPC** | ✅ Yes | Default or custom VPC (subnets, SGs) |
| Identity | **AWS IAM** | ✅ Yes | EC2 role, GitHub Actions deploy role |
| CI/CD | **GitHub Actions** | ✅ Yes | Build, test, deploy |
| Backend app | **NestJS** (Node.js) | ✅ Yes | REST API on EC2 |
| Frontend app | **Next.js** (static export) | ✅ Yes | Hosted on S3 + CloudFront |
| Process manager | **PM2** | ✅ Yes | Keeps API running on EC2 |
| Local DB (dev) | **PostgreSQL** | Optional | `localhost` when not using RDS |

---

## AWS resources (created by Terraform)

Naming pattern: `{project_name}-*` (default `revogue-*`).

### Networking & VPC

| Resource type | Terraform name | AWS name / ID pattern | File |
|---------------|----------------|------------------------|------|
| VPC (data) | `aws_vpc.default` or `aws_vpc.custom` | Default VPC or `var.vpc_id` | `main.tf` |
| VPC (data) | `aws_vpc.active` | Active VPC for CIDR/rules | `main.tf` |
| Subnets (data) | `aws_subnets.selected` | Subnets in that VPC | `main.tf` |
| Security group | `aws_security_group.ec2` | `revogue-ec2-sg` | `ec2.tf` |
| Security group | `aws_security_group.rds` | `revogue-rds-sg` | `main.tf` |
| Security group rule | `aws_security_group_rule.rds_from_ec2` | RDS ← EC2 on port 5432 | `ec2.tf` |

### Compute — EC2

| Resource type | Terraform name | Purpose | File |
|---------------|----------------|---------|------|
| AMI (data) | `aws_ami.amazon_linux_2023` | Amazon Linux 2023 image | `ec2.tf` |
| EC2 instance | `aws_instance.backend` | Runs NestJS API | `ec2.tf` |
| Elastic IP | `aws_eip.backend` | Stable IP for API Gateway | `ec2.tf` |
| EIP association | `aws_eip_association.backend` | Links EIP to instance | `ec2.tf` |
| IAM role | `aws_iam_role.ec2` | `revogue-ec2-role` | `ec2.tf` |
| IAM role attachment | `aws_iam_role_policy_attachment.ec2_ssm` | AWS managed: `AmazonSSMManagedInstanceCore` | `ec2.tf` |
| IAM instance profile | `aws_iam_instance_profile.ec2` | `revogue-ec2-profile` | `ec2.tf` |
| User data script | `user-data.sh.tpl` | Installs Node 20, PM2 on boot | `user-data.sh.tpl` |

**EC2 security group ingress:** SSH (22, optional), API port (default **3001**).

### Database — RDS

| Resource type | Terraform name | Purpose | File |
|---------------|----------------|---------|------|
| DB subnet group | `aws_db_subnet_group.main` | `revogue-db-subnet-group` | `main.tf` |
| RDS instance | `aws_db_instance.postgres` | `revogue-postgres` — PostgreSQL 15 | `main.tf` |

**Typical settings:** `db.t3.micro`, 20 GB gp3, encrypted, private (not public unless `publicly_accessible = true`).

### API — API Gateway (HTTP API v2)

| Resource type | Terraform name | Purpose | File |
|---------------|----------------|---------|------|
| HTTP API | `aws_apigatewayv2_api.main` | `revogue-api` | `api-gateway.tf` |
| Integration (proxy) | `aws_apigatewayv2_integration.ec2` | Proxy `/{proxy+}` → EC2 | `api-gateway.tf` |
| Integration (root) | `aws_apigatewayv2_integration.ec2_root` | Proxy `/` → EC2 | `api-gateway.tf` |
| Route | `aws_apigatewayv2_route.proxy` | `ANY /{proxy+}` | `api-gateway.tf` |
| Route | `aws_apigatewayv2_route.root` | `ANY /` | `api-gateway.tf` |
| Stage | `aws_apigatewayv2_stage.main` | Stage `prod` (auto-deploy) | `api-gateway.tf` |

**Public API URL:** `terraform output backend_api_url` → set as `NEXT_PUBLIC_API_URL`.

### Authentication — Cognito

| Resource type | Terraform name | Purpose | File |
|---------------|----------------|---------|------|
| User pool | `aws_cognito_user_pool.main` | `revogue-users` | `cognito.tf` |
| App client | `aws_cognito_user_pool_client.web` | `revogue-web-client` (no secret) | `cognito.tf` |

**Custom attribute:** `custom:role` (`buyer` / `seller`).  
**Callbacks:** CloudFront URL + localhost (from `locals.tf`).

### Frontend hosting — S3 + CloudFront

| Resource type | Terraform name | Purpose | File |
|---------------|----------------|---------|------|
| S3 bucket | `aws_s3_bucket.frontend` | `revogue-frontend-{account_id}` | `frontend.tf` |
| S3 versioning | `aws_s3_bucket_versioning.frontend` | Versioning enabled | `frontend.tf` |
| S3 encryption | `aws_s3_bucket_server_side_encryption_configuration.frontend` | AES-256 | `frontend.tf` |
| S3 public access block | `aws_s3_bucket_public_access_block.frontend` | Block public access | `frontend.tf` |
| CloudFront OAC | `aws_cloudfront_origin_access_control.frontend` | Secure S3 origin | `frontend.tf` |
| CloudFront distribution | `aws_cloudfront_distribution.frontend` | CDN for static site | `frontend.tf` |
| IAM policy document (data) | `aws_iam_policy_document.frontend_s3_policy` | Allow CloudFront → S3 | `frontend.tf` |
| S3 bucket policy | `aws_s3_bucket_policy.frontend` | OAC read access | `frontend.tf` |
| Caller identity (data) | `aws_caller_identity.current` | Account ID in bucket name | `frontend.tf` |

### IAM (GitHub Actions deploy)

| Resource type | Terraform name | Purpose | File |
|---------------|----------------|---------|------|
| IAM policy document (data) | `aws_iam_policy_document.github_deploy` | S3 + CloudFront permissions | `iam.tf` |
| IAM policy | `aws_iam_policy.github_deploy` | `revogue-github-deploy` | `iam.tf` |
| OIDC provider | `aws_iam_openid_connect_provider.github` | Trust GitHub Actions | `iam.tf` |
| IAM policy document (data) | `aws_iam_policy_document.github_oidc_assume` | Assume-role policy | `iam.tf` |
| IAM role | `aws_iam_role.github_actions` | `revogue-github-actions` | `iam.tf` |
| IAM role attachment | `aws_iam_role_policy_attachment.github_deploy` | Attach deploy policy | `iam.tf` |

**OIDC trust:** `repo:{github_repository}:*` (set in `terraform.tfvars`).

---

## Terraform (Infrastructure as Code)

| Item | Location |
|------|----------|
| Root module | `Backend/infrastructure/terraform/` |
| Variables example | `terraform.tfvars.example` |
| Lock file | `.terraform.lock.hcl` (commit to git) |
| Provider | `hashicorp/aws` ~> 5.x |
| Key outputs | `stack-outputs.tf`, `*-outputs.tf` |

**Commands:**

```bash
terraform init
terraform plan
terraform apply
terraform output deployment_summary
```

**Not managed by Terraform:** EC2 SSH key pair (create in AWS Console), GitHub secrets, local `.env` files.

---

## Docker

**Docker is not used** in this project.

| Expected in some stacks | ReVogue instead |
|------------------------|-----------------|
| `Dockerfile` for API | EC2 + Node.js + PM2 |
| `docker-compose` for local dev | Local Node + PostgreSQL (or RDS) |
| ECS / EKS | Single EC2 instance |

---

## GitHub Actions (CI/CD)

| Workflow | File | Trigger | What it does |
|----------|------|---------|--------------|
| **CI** | `.github/workflows/ci.yml` | PR, `develop` push, reusable | Build backend & frontend; `terraform validate` |
| **Deploy** | `.github/workflows/deploy.yml` | `main` push, manual | Deploy API → EC2 (SSH); frontend → S3 + CloudFront (OIDC) |

See [`.github/CICD.md`](../../.github/CICD.md) for required secrets.

---

## Application & runtime (not AWS, but part of the stack)

| Component | Location | Role |
|-----------|----------|------|
| **NestJS backend** | `Backend/revogue-backend/` | REST API, TypeORM, Cognito JWT guard |
| **Next.js frontend** | `Frontend/revogue-frontend/` | Static export → S3 |
| **PM2** | `ecosystem.config.js` on EC2 | Process manager for `dist/main.js` |
| **TypeORM** | Backend | ORM for PostgreSQL |
| **aws-jwt-verify** | Backend npm | Validates Cognito access tokens |
| **aws-amplify** | Frontend npm | Cognito sign-in / sign-up in browser |
| **SQL migrations** | `Backend/revogue-backend/migrations/*.sql` | Schema (`npm run db:migrate`) |

---

## Environment configuration files

| File | Used by |
|------|---------|
| `Backend/.env` | Local backend dev |
| `Backend/.env.production` | EC2 deploy / GitHub Actions |
| `Frontend/revogue-frontend/.env.local` | Local frontend dev |
| `Frontend/revogue-frontend/.env.production` | S3/CloudFront build |

Examples: `Backend/.env.production.example`, `Frontend/revogue-frontend/.env.production.example`.

---

## How resources connect

```
                    ┌─────────────────┐
                    │  GitHub Actions │
                    │  (CI / Deploy)  │
                    └────────┬────────┘
                             │ OIDC → S3/CF
                             │ SSH  → EC2
                             ▼
┌──────────┐    HTTPS    ┌─────────────┐    HTTP     ┌─────────┐    SQL    ┌─────┐
│ Browser  │ ──────────► │ CloudFront  │             │   EC2   │ ────────► │ RDS │
│          │ ──────────► │     + S3    │             │ NestJS  │           │ PG  │
│          │ ── JWT ───► │  (frontend) │             │  :3001  │           └─────┘
│          │ ── API ───► │ API Gateway │ ──────────► └─────────┘
└──────────┘             └─────────────┘
       │
       └──────────────── Cognito (auth)
```

---

## Quick reference: Terraform output → app config

| Terraform output | Use in |
|------------------|--------|
| `backend_api_url` | `NEXT_PUBLIC_API_URL` |
| `frontend_url` | `FRONTEND_URL`, Cognito callbacks |
| `cognito_user_pool_id` | Backend + frontend Cognito env |
| `cognito_client_id` | Backend + frontend Cognito env |
| `frontend_s3_bucket` | GitHub secret / `npm run deploy` |
| `frontend_cloudfront_distribution_id` | GitHub secret / CloudFront invalidation |
| `ec2_elastic_ip` | GitHub secret `EC2_HOST` |
| `github_actions_role_arn` | GitHub secret `AWS_DEPLOY_ROLE_ARN` |
| `rds_endpoint` | `DB_HOST` in backend `.env` |

```bash
cd Backend/infrastructure/terraform
terraform output deployment_summary
terraform output github_secrets_checklist
```

---


## Related docs

- [README.md](./README.md) — Setup and deploy steps  
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Architecture diagram and flow  
- [../../.github/CICD.md](../../.github/CICD.md) — GitHub Actions secrets

---

## Missing or Not Yet Implemented Resources

| Resource                | Status / Notes                                                                 |
|-------------------------|-------------------------------------------------------------------------------|
| **Internet Gateway**    | Not in any .tf file                                                           |
| **NAT Gateway**         | Not listed anywhere                                                           |
| **Public Subnets**      | Only generic `aws_subnets.selected` used; no explicit public/private split     |
| **Private Subnets**     | Same as above; no dedicated private subnet resources                          |
| **Route Tables**        | Not mentioned; no public→IGW or private→NAT routing defined                   |
| **Public ALB**          | Not in docs or any .tf                                                        |
| **Internal ALB**        | Not in docs or any .tf                                                        |
| **VPC Link (API GW→ALB)** | Docs mention future use, but no Terraform resource defined                   |
| **ElastiCache Redis**   | Completely absent                                                             |
| **CloudWatch Log Groups** | Not listed                                                                   |
| **Cloud Map / Service Discovery** | Not listed                                                          |
| **ECS Task Definitions** | Referenced conceptually, but no Terraform resources listed                   |
| **ECS Services**        | No `aws_ecs_service` resources listed                                         |
| **Security Groups for ALB/ECS/Redis** | Only EC2 and RDS SGs exist                                      |

> **Note:** These resources are required for a full production-grade ECS microservices deployment. See `MIGRATION.md` for migration plans and update this file as resources are added.

---

## Microservices & ECS Migration

The project is evolving from a monolithic EC2/NestJS backend to a microservices architecture using ECS Fargate. Microservices are defined in `Backend/services/`:

| Service        | Port  | ECR repo               |
| -------------- | ----- | ---------------------- |
| frontend       | 3000  | revogue-frontend       |
| gateway        | 8080  | revogue-gateway        |
| catalog        | 3001  | revogue-catalog        |
| cart           | 3002  | revogue-cart           |
| order          | 3003  | revogue-order          |
| payment        | 3004  | revogue-payment        |
| notification   | 3005  | revogue-notification   |

Each service is a NestJS stub exposing `GET /health`. See `Backend/services/README.md` for details.

**Shared code:** The `Backend/services/shared/` folder is reserved for common libraries (currently empty).

### Local Development

- Build all services: `cd Backend/services/scripts && ./build-all.sh`
- Each service has a `main.ts` entry point and standard NestJS structure.
- Dockerfiles are present for each service (for ECS/ECR use).

### ECS/Fargate Migration

- Migration is controlled by `enable_ecs_infrastructure` in `terraform.tfvars` (default: `false`).
- See `MIGRATION.md` for full checklist and cutover steps.
- When enabled, ECS services are provisioned and API Gateway routes via VPC Link to the ECS gateway service.
- Database schemas for services are created by running `006_service_schemas.sql` against RDS.

#### Migration Checklist (summary)

- [ ] Set `enable_ecs_infrastructure = true` in `terraform.tfvars`
- [ ] Build and push all service images to ECR
- [ ] Run `terraform apply` and validate ECS services
- [ ] Run DB schema migration for services
- [ ] Update frontend/backend environment configs as needed
- [ ] Decommission EC2 after ECS is stable

---
