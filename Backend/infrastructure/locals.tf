locals {
  vpc_id = var.vpc_id != "" ? data.aws_vpc.custom[0].id : data.aws_vpc.default[0].id

  frontend_url = "https://${aws_cloudfront_distribution.frontend.domain_name}"

  cognito_callback_urls = concat(
    [
      local.frontend_url,
      "${local.frontend_url}/",
      "http://localhost:3000",
      "http://localhost:3002",
    ],
    var.cognito_callback_urls_extra,
  )

  cognito_logout_urls = concat(
    [
      "${local.frontend_url}/login",
      "http://localhost:3002/login",
    ],
    var.cognito_logout_urls_extra,
  )
}
