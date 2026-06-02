# CloudWatch log groups per ECS service

resource "aws_cloudwatch_log_group" "ecs_service" {
  for_each = local.ecs_enabled ? local.microservices : {}

  name              = "/ecs/${var.project_name}/${each.key}"
  retention_in_days = var.ecs_log_retention_days

  tags = {
    Name    = "${var.project_name}-logs-${each.key}"
    Project = var.project_name
    Service = each.key
  }
}

resource "aws_cloudwatch_dashboard" "ecs" {
  count = local.ecs_enabled ? 1 : 0

  dashboard_name = "${var.project_name}-ecs"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 2
        properties = {
          markdown = "# ReVogue ECS Fargate — CPU / Memory (add Container Insights for richer metrics)"
        }
      }
    ]
  })
}
