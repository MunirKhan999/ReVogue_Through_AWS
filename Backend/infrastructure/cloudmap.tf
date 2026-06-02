# AWS Cloud Map — private DNS for service-to-service calls

resource "aws_service_discovery_private_dns_namespace" "commerce" {
  count = local.ecs_enabled ? 1 : 0

  name        = var.ecs_cloudmap_namespace
  description = "ReVogue microservices discovery"
  vpc         = aws_vpc.main[0].id

  tags = {
    Name    = "${var.project_name}-cloudmap"
    Project = var.project_name
  }
}

resource "aws_service_discovery_service" "microservice" {
  for_each = local.ecs_enabled ? local.microservices : {}

  name = each.key

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.commerce[0].id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }

  tags = {
    Name    = "${var.project_name}-sd-${each.key}"
    Project = var.project_name
  }
}
