output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.backend.id
}

output "ec2_public_ip" {
  description = "Public IP of the backend EC2 instance"
  value       = aws_instance.backend.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the backend EC2 instance"
  value       = aws_instance.backend.public_dns
}

output "ec2_elastic_ip" {
  description = "Stable Elastic IP for EC2 (used by API Gateway integration)"
  value       = aws_eip.backend.public_ip
}

output "backend_ssh_command" {
  description = "SSH command (requires ec2_key_name in terraform.tfvars)"
  value       = var.ec2_key_name != "" ? "ssh -i ~/.ssh/${var.ec2_key_name}.pem ec2-user@${aws_eip.backend.public_ip}" : "Use AWS SSM Session Manager (no SSH key configured)"
}
