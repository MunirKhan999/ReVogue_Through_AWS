output "api_gateway_url" {
  description = "Public HTTPS API URL — set as NEXT_PUBLIC_API_URL"
  value       = aws_apigatewayv2_stage.main.invoke_url
}

output "api_gateway_id" {
  description = "API Gateway HTTP API ID"
  value       = aws_apigatewayv2_api.main.id
}
