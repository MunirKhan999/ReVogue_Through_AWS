# VPC — default VPC or custom (var.vpc_id). EC2, RDS, and security groups share this network.

output "vpc_id" {
  description = "VPC used by EC2 and RDS"
  value       = local.vpc_id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = data.aws_vpc.active.cidr_block
}

output "private_subnet_ids" {
  description = "Subnet IDs (default VPC subnets)"
  value       = data.aws_subnets.selected.ids
}
