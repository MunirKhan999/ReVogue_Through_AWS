output "frontend_s3_bucket" {
  description = "S3 bucket name for frontend static files"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_cloudfront_domain" {
  description = "CloudFront URL to access the frontend"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "frontend_env_snippet" {
  description = "Set these when building the frontend for production"
  value       = <<-EOT
    NEXT_PUBLIC_API_URL=https://your-api.example.com
    NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
    NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
  EOT
}
