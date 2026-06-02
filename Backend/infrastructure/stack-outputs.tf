# Coordinated outputs — wire frontend, backend, and CI/CD

output "backend_api_url" {
  description = "Public API URL (API Gateway) — use for NEXT_PUBLIC_API_URL"
  value       = aws_apigatewayv2_stage.main.invoke_url
}

output "backend_api_integration" {
  description = "ec2 or vpc_link_alb depending on enable_ecs_infrastructure"
  value       = var.enable_ecs_infrastructure ? "vpc_link_alb" : "ec2_http_proxy"
}

output "frontend_url" {
  description = "CloudFront frontend URL — use for FRONTEND_URL and Cognito callbacks"
  value       = local.frontend_url
}

output "deployment_summary" {
  description = "Quick reference after terraform apply"
  value = {
    api_url             = aws_apigatewayv2_stage.main.invoke_url
    frontend_url        = local.frontend_url
    cognito_user_pool   = aws_cognito_user_pool.main.id
    cognito_client_id   = aws_cognito_user_pool_client.web.id
    ec2_public_ip       = aws_eip.backend.public_ip
    rds_endpoint        = aws_db_instance.postgres.address
    s3_bucket           = aws_s3_bucket.frontend.id
    cloudfront_id       = aws_cloudfront_distribution.frontend.id
    github_actions_role = var.enable_github_oidc ? aws_iam_role.github_actions[0].arn : null
  }
}

output "backend_env_snippet" {
  description = "Production Backend/.env.production"
  value       = <<-EOT
    NODE_ENV=production
    PORT=${var.backend_port}
    DB_HOST=${aws_db_instance.postgres.address}
    DB_PORT=5432
    DB_USERNAME=${var.db_username}
    DB_PASSWORD=<from-terraform.tfvars>
    DB_NAME=${var.db_name}
    DB_SSL=true
    DB_SYNCHRONIZE=false
    COGNITO_USER_POOL_ID=${aws_cognito_user_pool.main.id}
    COGNITO_CLIENT_ID=${aws_cognito_user_pool_client.web.id}
    FRONTEND_URL=${local.frontend_url}
  EOT
}

output "frontend_env_snippet" {
  description = "Frontend/revogue-frontend/.env.production"
  value       = <<-EOT
    NEXT_PUBLIC_API_URL=${aws_apigatewayv2_stage.main.invoke_url}
    NEXT_PUBLIC_COGNITO_USER_POOL_ID=${aws_cognito_user_pool.main.id}
    NEXT_PUBLIC_COGNITO_CLIENT_ID=${aws_cognito_user_pool_client.web.id}
  EOT
}

output "github_secrets_checklist" {
  description = "Map these to GitHub Actions secrets (see .github/CICD.md)"
  value = {
    AWS_DEPLOY_ROLE_ARN                 = var.enable_github_oidc ? aws_iam_role.github_actions[0].arn : "enable_github_oidc or use access keys"
    AWS_REGION                          = var.aws_region
    EC2_HOST                            = aws_eip.backend.public_ip
    FRONTEND_S3_BUCKET                  = aws_s3_bucket.frontend.id
    FRONTEND_CLOUDFRONT_DISTRIBUTION_ID = aws_cloudfront_distribution.frontend.id
    NEXT_PUBLIC_API_URL                 = aws_apigatewayv2_stage.main.invoke_url
    NEXT_PUBLIC_COGNITO_USER_POOL_ID    = aws_cognito_user_pool.main.id
    NEXT_PUBLIC_COGNITO_CLIENT_ID       = aws_cognito_user_pool_client.web.id
    FRONTEND_URL                        = local.frontend_url
    DB_HOST                             = aws_db_instance.postgres.address
    DB_USERNAME                         = var.db_username
    DB_NAME                             = var.db_name
    COGNITO_USER_POOL_ID                = aws_cognito_user_pool.main.id
    COGNITO_CLIENT_ID                   = aws_cognito_user_pool_client.web.id
  }
}
