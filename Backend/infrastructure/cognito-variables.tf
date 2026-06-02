variable "cognito_callback_urls_extra" {
  description = "Additional Cognito callback URLs"
  type        = list(string)
  default     = []
}

variable "cognito_logout_urls_extra" {
  description = "Additional Cognito sign-out URLs"
  type        = list(string)
  default     = []
}
