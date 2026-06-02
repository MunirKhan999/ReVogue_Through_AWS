locals {
  ecs_enabled = var.enable_ecs_infrastructure

  azs = slice(data.aws_availability_zones.available.names, 0, 2)

  microservices = {
    frontend = {
      port    = 3000
      cpu     = var.ecs_task_cpu
      memory  = var.ecs_task_memory
      public  = false
      command = ["node", "dist/main.js"]
    }
    gateway = {
      port    = 8080
      cpu     = var.ecs_task_cpu
      memory  = var.ecs_task_memory
      public  = true
      command = ["node", "dist/main.js"]
    }
    catalog = {
      port    = 3001
      cpu     = var.ecs_task_cpu
      memory  = var.ecs_task_memory
      public  = false
      command = ["node", "dist/main.js"]
    }
    cart = {
      port    = 3002
      cpu     = var.ecs_task_cpu
      memory  = var.ecs_task_memory
      public  = false
      command = ["node", "dist/main.js"]
    }
    order = {
      port    = 3003
      cpu     = var.ecs_task_cpu
      memory  = var.ecs_task_memory
      public  = false
      command = ["node", "dist/main.js"]
    }
    payment = {
      port    = 3004
      cpu     = var.ecs_task_cpu
      memory  = var.ecs_task_memory
      public  = false
      command = ["node", "dist/main.js"]
    }
    notification = {
      port    = 3005
      cpu     = var.ecs_task_cpu
      memory  = var.ecs_task_memory
      public  = false
      command = ["node", "dist/main.js"]
    }
  }

  internal_listener_priorities = {
    frontend     = 110
    catalog      = 120
    cart         = 130
    order        = 140
    payment      = 150
    notification = 160
  }

  ecs_common_env = local.ecs_enabled ? [
    { name = "NODE_ENV", value = "production" },
    { name = "AWS_REGION", value = var.aws_region },
    { name = "DB_HOST", value = aws_db_instance.postgres.address },
    { name = "DB_PORT", value = "5432" },
    { name = "DB_USERNAME", value = var.db_username },
    { name = "DB_PASSWORD", value = var.db_password },
    { name = "DB_NAME", value = var.db_name },
    { name = "DB_SSL", value = "true" },
    { name = "COGNITO_USER_POOL_ID", value = aws_cognito_user_pool.main.id },
    { name = "COGNITO_CLIENT_ID", value = aws_cognito_user_pool_client.web.id },
    { name = "REDIS_PORT", value = "6379" },
    { name = "CLOUDMAP_NAMESPACE", value = var.ecs_cloudmap_namespace },
    { name = "CATALOG_SERVICE_URL", value = "http://catalog.${var.ecs_cloudmap_namespace}:3001" },
    { name = "CART_SERVICE_URL", value = "http://cart.${var.ecs_cloudmap_namespace}:3002" },
    { name = "ORDER_SERVICE_URL", value = "http://order.${var.ecs_cloudmap_namespace}:3003" },
    { name = "PAYMENT_SERVICE_URL", value = "http://payment.${var.ecs_cloudmap_namespace}:3004" },
    { name = "NOTIFICATION_SERVICE_URL", value = "http://notification.${var.ecs_cloudmap_namespace}:3005" },
  ] : []
}

data "aws_availability_zones" "available" {
  state = "available"
}
