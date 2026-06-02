# ECS Fargate cluster, task definitions, services

resource "aws_ecs_cluster" "main" {
  count = local.ecs_enabled ? 1 : 0

  name = var.ecs_cluster_name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name    = var.ecs_cluster_name
    Project = var.project_name
  }
}

resource "aws_ecs_task_definition" "service" {
  for_each = local.ecs_enabled ? local.microservices : {}

  family                   = "${var.project_name}-${each.key}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = each.value.cpu
  memory                   = each.value.memory
  execution_role_arn       = aws_iam_role.ecs_execution[0].arn
  task_role_arn            = aws_iam_role.ecs_task[0].arn

  container_definitions = jsonencode([
    {
      name      = each.key
      image     = "${aws_ecr_repository.service[each.key].repository_url}:${var.ecs_container_image_tag}"
      essential = true
      command   = each.value.command
      portMappings = [
        {
          containerPort = each.value.port
          hostPort      = each.value.port
          protocol      = "tcp"
        }
      ]
      environment = concat(
        local.ecs_common_env,
        [
          { name = "SERVICE_NAME", value = each.key },
          { name = "PORT", value = tostring(each.value.port) },
          {
            name  = "REDIS_HOST"
            value = aws_elasticache_replication_group.redis[0].primary_endpoint_address
          },
        ]
      )
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_service[each.key].name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = each.key
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "curl -sf http://localhost:${each.value.port}/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])

  tags = {
    Name    = "${var.project_name}-task-${each.key}"
    Project = var.project_name
  }
}

resource "aws_ecs_service" "microservice" {
  for_each = local.ecs_enabled ? local.microservices : {}

  name            = "${var.project_name}-${each.key}"
  cluster         = aws_ecs_cluster.main[0].id
  task_definition = aws_ecs_task_definition.service[each.key].arn
  desired_count   = var.ecs_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_tasks[0].id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.microservice[each.key].arn
  }

  dynamic "load_balancer" {
    for_each = each.value.public ? [1] : []
    content {
      target_group_arn = aws_lb_target_group.gateway_public[0].arn
      container_name   = each.key
      container_port   = each.value.port
    }
  }

  dynamic "load_balancer" {
    for_each = each.value.public ? [] : [1]
    content {
      target_group_arn = aws_lb_target_group.internal[each.key].arn
      container_name   = each.key
      container_port   = each.value.port
    }
  }

  depends_on = [
    aws_lb_listener.public_http,
    aws_lb_listener.internal_http,
    aws_lb_listener_rule.internal_services,
  ]

  tags = {
    Name    = "${var.project_name}-svc-${each.key}"
    Project = var.project_name
  }
}
