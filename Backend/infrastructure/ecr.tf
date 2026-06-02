# Amazon ECR — one repository per microservice

resource "aws_ecr_repository" "service" {
  for_each = local.ecs_enabled ? local.microservices : {}

  name                 = "${var.project_name}-${each.key}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name    = "${var.project_name}-ecr-${each.key}"
    Project = var.project_name
    Service = each.key
  }
}

resource "aws_ecr_lifecycle_policy" "service" {
  for_each = local.ecs_enabled ? local.microservices : {}

  repository = aws_ecr_repository.service[each.key].name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last ${var.ecr_image_count_to_keep} images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = var.ecr_image_count_to_keep
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
