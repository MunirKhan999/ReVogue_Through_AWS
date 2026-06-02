# Application Load Balancers — public (gateway) + internal (microservices)

resource "aws_lb" "public" {
  count = local.ecs_enabled ? 1 : 0

  name               = "${var.project_name}-alb-public"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_public[0].id]
  subnets            = aws_subnet.public[*].id

  depends_on = [aws_internet_gateway.ecs]

  tags = {
    Name    = "${var.project_name}-alb-public"
    Project = var.project_name
  }
}

resource "aws_lb" "internal" {
  count = local.ecs_enabled ? 1 : 0

  name               = "${var.project_name}-alb-internal"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_internal[0].id]
  subnets            = aws_subnet.private[*].id

  tags = {
    Name    = "${var.project_name}-alb-internal"
    Project = var.project_name
  }
}

resource "aws_lb_target_group" "gateway_public" {
  count = local.ecs_enabled ? 1 : 0

  name        = "${var.project_name}-tg-gateway-pub"
  port        = local.microservices.gateway.port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main[0].id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Name    = "${var.project_name}-tg-gateway-public"
    Project = var.project_name
  }
}

resource "aws_lb_target_group" "internal" {
  for_each = local.ecs_enabled ? {
    for k, v in local.microservices : k => v if !v.public
  } : {}

  name        = "${var.project_name}-tg-${each.key}"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main[0].id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  tags = {
    Name    = "${var.project_name}-tg-${each.key}"
    Project = var.project_name
  }
}

resource "aws_lb_listener" "public_http" {
  count = local.ecs_enabled ? 1 : 0

  load_balancer_arn = aws_lb.public[0].arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.gateway_public[0].arn
  }
}

resource "aws_lb_listener" "internal_http" {
  count = local.ecs_enabled ? 1 : 0

  load_balancer_arn = aws_lb.internal[0].arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "ReVogue internal ALB — use path rules"
      status_code  = "404"
    }
  }
}

resource "aws_lb_listener_rule" "internal_services" {
  for_each = local.ecs_enabled ? {
    for k, v in local.microservices : k => v if !v.public
  } : {}

  listener_arn = aws_lb_listener.internal_http[0].arn
  priority     = local.internal_listener_priorities[each.key]

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.internal[each.key].arn
  }

  condition {
    path_pattern {
      values = ["/${each.key}", "/${each.key}/*"]
    }
  }
}
