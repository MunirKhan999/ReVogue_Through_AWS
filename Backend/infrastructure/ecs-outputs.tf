output "ecs_enabled" {
  description = "Whether ECS infrastructure is provisioned"
  value       = var.enable_ecs_infrastructure
}

output "ecs_vpc_id" {
  value = try(aws_vpc.main[0].id, null)
}

output "ecs_cluster_name" {
  value = try(aws_ecs_cluster.main[0].name, null)
}

output "ecs_cluster_arn" {
  value = try(aws_ecs_cluster.main[0].arn, null)
}

output "alb_public_dns_name" {
  description = "Public ALB DNS (API Gateway VPC Link target)"
  value       = try(aws_lb.public[0].dns_name, null)
}

output "alb_internal_dns_name" {
  description = "Internal ALB DNS"
  value       = try(aws_lb.internal[0].dns_name, null)
}

output "ecr_repository_urls" {
  description = "ECR URLs per microservice"
  value = {
    for k, v in aws_ecr_repository.service : k => v.repository_url
  }
}

output "redis_primary_endpoint" {
  value = try(aws_elasticache_replication_group.redis[0].primary_endpoint_address, null)
}

output "cloudmap_namespace_id" {
  value = try(aws_service_discovery_private_dns_namespace.commerce[0].id, null)
}

output "cloudmap_namespace_name" {
  value = var.ecs_cloudmap_namespace
}

output "ecs_service_dns_names" {
  description = "Private DNS names for service-to-service calls"
  value = {
    for k, v in local.microservices : k => "${k}.${var.ecs_cloudmap_namespace}:${v.port}"
  }
}

output "api_gateway_integration_mode" {
  value = var.enable_ecs_infrastructure ? "vpc_link_alb" : "ec2_http_proxy"
}
