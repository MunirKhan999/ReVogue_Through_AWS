# API Gateway HTTP API — public HTTPS entry point → NestJS on EC2

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
  description   = "ReVogue NestJS API via EC2"

  cors_configuration {
    allow_origins = concat(
      [
        "http://localhost:3000",
        "http://localhost:3002",
        local.frontend_url,
      ],
      var.api_gateway_cors_origins_extra,
    )
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["Authorization", "Content-Type", "X-Requested-With"]
    max_age       = 300
  }

  tags = {
    Name    = "${var.project_name}-api"
    Project = var.project_name
  }
}

resource "aws_apigatewayv2_integration" "ec2" {
  count = local.ecs_enabled ? 0 : 1

  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "http://${aws_eip.backend.public_ip}:${var.backend_port}/{proxy}"
  connection_type    = "INTERNET"

  request_parameters = {
    "overwrite:path" = "$request.path.proxy"
  }
}

resource "aws_apigatewayv2_integration" "ec2_root" {
  count = local.ecs_enabled ? 0 : 1

  api_id             = aws_apigatewayv2_api.main.id
  integration_type   = "HTTP_PROXY"
  integration_method = "ANY"
  integration_uri    = "http://${aws_eip.backend.public_ip}:${var.backend_port}"
  connection_type    = "INTERNET"
}

resource "aws_apigatewayv2_route" "proxy" {
  count = local.ecs_enabled ? 0 : 1

  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.ec2[0].id}"
}

resource "aws_apigatewayv2_route" "root" {
  count = local.ecs_enabled ? 0 : 1

  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /"
  target    = "integrations/${aws_apigatewayv2_integration.ec2_root[0].id}"
}

resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.api_gateway_stage_name
  auto_deploy = true

  tags = {
    Name    = "${var.project_name}-api-${var.api_gateway_stage_name}"
    Project = var.project_name
  }
}
