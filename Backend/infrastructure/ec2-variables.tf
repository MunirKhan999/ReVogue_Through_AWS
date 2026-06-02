variable "ec2_instance_type" {
  description = "EC2 instance type for the NestJS backend"
  type        = string
  default     = "t3.micro"
}

variable "ec2_key_name" {
  description = "Existing EC2 key pair name for SSH (create in AWS Console). Leave empty to use SSM Session Manager only."
  type        = string
  default     = ""
}

variable "ec2_ssh_cidr_blocks" {
  description = "CIDR blocks allowed to SSH to EC2 (port 22). Your IP as x.x.x.x/32"
  type        = list(string)
  default     = []
}

variable "ec2_api_cidr_blocks" {
  description = "CIDR blocks allowed to reach the API port. Use [\"0.0.0.0/0\"] for public API."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "backend_port" {
  description = "Port the NestJS app listens on"
  type        = number
  default     = 3001
}
