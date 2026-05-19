output "rds_endpoint" {
  description = "RDS instance hostname"
  value       = aws_db_instance.postgres.address
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.postgres.port
}

output "rds_database_name" {
  description = "Database name"
  value       = aws_db_instance.postgres.db_name
}

output "rds_username" {
  description = "Master username"
  value       = aws_db_instance.postgres.username
}

output "backend_env_snippet" {
  description = "Copy these into Backend/.env"
  value       = <<-EOT
    DB_HOST=${aws_db_instance.postgres.address}
    DB_PORT=${aws_db_instance.postgres.port}
    DB_USERNAME=${aws_db_instance.postgres.username}
    DB_PASSWORD=<your-terraform-db_password>
    DB_NAME=${aws_db_instance.postgres.db_name}
    DB_SSL=true
    DB_SYNCHRONIZE=false
  EOT
}
