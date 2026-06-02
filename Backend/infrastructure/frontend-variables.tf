variable "frontend_domain_name" {
  description = "Optional custom domain for CloudFront (e.g. app.example.com)"
  type        = string
  default     = ""
}

variable "frontend_acm_certificate_arn" {
  description = "ACM certificate ARN in us-east-1 for custom domain (required if frontend_domain_name is set)"
  type        = string
  default     = ""
}

variable "cloudfront_price_class" {
  description = "CloudFront price class (PriceClass_100, PriceClass_200, PriceClass_All)"
  type        = string
  default     = "PriceClass_100"
}
