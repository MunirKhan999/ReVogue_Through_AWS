# ------------------------------------------------------------------------------
# ECS / microservices — set enable_ecs_infrastructure = true to provision
# DESTRUCTIVE if changing VPC for existing RDS: see MIGRATION.md first
# ------------------------------------------------------------------------------

variable "enable_ecs_infrastructure" {
  description = "Provision ECS Fargate microservices VPC, ALB, ECR, Redis, etc. Keeps legacy EC2 path when false."
  type        = bool
  default     = false
}

variable "ecs_vpc_cidr" {
  description = "CIDR for dedicated microservices VPC"
  type        = string
  default     = "10.40.0.0/16"
}

variable "ecs_public_subnet_cidrs" {
  description = "Public subnet CIDRs (one per AZ)"
  type        = list(string)
  default     = ["10.40.1.0/24", "10.40.2.0/24"]
}

variable "ecs_private_subnet_cidrs" {
  description = "Private subnet CIDRs (one per AZ)"
  type        = list(string)
  default     = ["10.40.3.0/24", "10.40.4.0/24"]
}

variable "ecs_single_nat_gateway" {
  description = "Use one NAT GW (cheaper) vs one per AZ"
  type        = bool
  default     = true
}

variable "ecs_cluster_name" {
  type    = string
  default = "revogue-cluster"
}

variable "ecs_cloudmap_namespace" {
  type    = string
  default = "commerce.local"
}

variable "ecs_log_retention_days" {
  type    = number
  default = 7
}

variable "ecs_task_cpu" {
  type    = number
  default = 256
}

variable "ecs_task_memory" {
  type    = number
  default = 512
}

variable "ecs_desired_count" {
  description = "Desired task count per microservice"
  type        = number
  default     = 1
}

variable "ecs_container_image_tag" {
  description = "Image tag for all services until per-service tags in CI"
  type        = string
  default     = "latest"
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ on existing RDS (causes brief failover). Requires explicit opt-in."
  type        = bool
  default     = false
}

variable "rds_allow_ecs_access" {
  description = "Add security group rule: ECS tasks → RDS"
  type        = bool
  default     = true
}

variable "redis_node_type" {
  type    = string
  default = "cache.t3.micro"
}

variable "ecr_image_count_to_keep" {
  type    = number
  default = 10
}
