# EC2 Monolith → ECS Fargate Migration Guide

## ⚠️ Before you run `enable_ecs_infrastructure = true`

| Change | Destructive? | Action |
|--------|--------------|--------|
| New VPC `10.40.0.0/16` | No (additive) | Safe — legacy EC2/RDS stay on default VPC |
| API Gateway → VPC Link | No | Swaps integration when flag enabled |
| `rds_multi_az = true` | **Brief failover** | Opt-in only; default `false` |
| Moving RDS to ECS VPC | **Yes** | Requires snapshot restore — not automated |
| Deleting EC2 | **Yes** | Manual after ECS validated |

**Default:** `enable_ecs_infrastructure = false` — existing stack unchanged.

## Enable ECS (greenfield path)

```hcl
# terraform.tfvars
enable_ecs_infrastructure = true
enable_github_oidc          = true
github_repository           = "YOUR_ORG/revogue"
```

```bash
terraform plan   # review ~50+ new resources
terraform apply
```

## Build & push images

```bash
cd Backend/services
./scripts/build-all.sh   # or GitHub Actions deploy-ecs.yml
```

## Database schemas (manual, on existing RDS)

```bash
psql $DATABASE_URL -f revogue-backend/migrations/006_service_schemas.sql
```

Creates schemas: `catalog`, `orders`, `notification`.

## Cutover checklist

1. [ ] `terraform apply` with ECS enabled
2. [ ] Push images to all ECR repos
3. [ ] ECS services healthy (`/health` on each)
4. [ ] API Gateway returns data via VPC Link → public ALB → gateway
5. [ ] Update `NEXT_PUBLIC_API_URL` (same API Gateway URL)
6. [ ] Run `006_service_schemas.sql`
7. [ ] Load test catalog/cart/order flows
8. [ ] Set `rds_multi_az = true` when ready (maintenance window)
9. [ ] Scale down EC2 / remove EC2 from API Gateway (automatic when ECS flag on)
10. [ ] Optional: decommission EC2 instance after 1 week stable

## Rollback

```hcl
enable_ecs_infrastructure = false
```

```bash
terraform apply  # restores API Gateway → EC2 integration
```
