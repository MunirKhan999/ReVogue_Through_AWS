variable "aws_region" {
  description = "AWS region for RDS"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "revogue"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "revogue"
}

variable "db_username" {
  description = "Master username for RDS"
  type        = string
  default     = "revogue_admin"
}

variable "db_password" {
  description = "Master password for RDS (min 8 characters)"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "publicly_accessible" {
  description = "Whether the RDS instance is publicly accessible (dev only)"
  type        = bool
  default     = false
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to connect to RDS on port 5432"
  type        = list(string)
  default     = []
}

variable "vpc_id" {
  description = "VPC ID (leave empty to use default VPC)"
  type        = string
  default     = ""
}
