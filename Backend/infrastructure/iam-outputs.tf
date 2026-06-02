output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions (set as AWS_DEPLOY_ROLE_ARN secret)"
  value       = var.enable_github_oidc ? aws_iam_role.github_actions[0].arn : ""
}

output "ec2_instance_profile_arn" {
  description = "EC2 instance profile for SSM / future AWS API access"
  value       = aws_iam_instance_profile.ec2.arn
}
