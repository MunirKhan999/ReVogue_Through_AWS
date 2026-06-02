# API Gateway → VPC Link → Public ALB (ECS gateway)
# Legacy EC2 integrations remain in api-gateway.tf when enable_ecs_infrastructure = false

resource "aws_apigatewayv2_vpc_link" "ecs" {
  count = local.ecs_enabled ? 1 : 0

  name               = "${var.project_name}-vpc-link"
  security_group_ids = [aws_security_group.vpc_link[0].id]
  subnet_ids         = aws_subnet.public[*].id

  tags = {
    Name    = "${var.project_name}-vpc-link"
    Project = var.project_name
  }
}

resource "aws_apigatewayv2_integration" "alb" {
  count = local.ecs_enabled ? 1 : 0

  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = aws_lb_listener.public_http[0].arn
  connection_type    = "VPC_LINK"
  connection_id      = aws_apigatewayv2_vpc_link.ecs[0].id

  request_parameters = {
    "overwrite:path" = "$request.path.proxy"
  }
}

resource "aws_apigatewayv2_route" "proxy_ecs" {
  count = local.ecs_enabled ? 1 : 0

  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.alb[0].id}"
}

resource "aws_apigatewayv2_route" "root_ecs" {
  count = local.ecs_enabled ? 1 : 0

  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /"
  target    = "integrations/${aws_apigatewayv2_integration.alb[0].id}"
}
