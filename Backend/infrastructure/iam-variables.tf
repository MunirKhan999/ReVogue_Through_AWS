variable "enable_github_oidc" {
  description = "Create IAM OIDC provider and role for GitHub Actions"
  type        = bool
  default     = true
}

variable "github_repository" {
  description = "GitHub repo in OWNER/NAME format for OIDC trust policy"
  type        = string
  default     = "YOUR_GITHUB_ORG/revogue"
}

variable "devops_user_name" {
  description = "IAM user name for the DevOps account running Terraform"
  type        = string
  default     = "DevOPs"
}
