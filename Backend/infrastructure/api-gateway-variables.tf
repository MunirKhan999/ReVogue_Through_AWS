variable "api_gateway_stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "prod"
}

variable "api_gateway_cors_origins_extra" {
  description = "Extra allowed CORS origins for API Gateway"
  type        = list(string)
  default     = []
}
