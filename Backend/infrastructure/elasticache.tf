# ElastiCache Redis 7 — Multi-AZ replication group

resource "aws_security_group" "redis" {
  count = local.ecs_enabled ? 1 : 0

  name        = "${var.project_name}-redis-sg"
  description = "Redis for ECS microservices"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    description     = "Redis from ECS"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_tasks[0].id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-redis-sg"
    Project = var.project_name
  }
}

resource "aws_elasticache_subnet_group" "redis" {
  count = local.ecs_enabled ? 1 : 0

  name       = "${var.project_name}-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name    = "${var.project_name}-redis-subnet-group"
    Project = var.project_name
  }
}

resource "aws_elasticache_replication_group" "redis" {
  count = local.ecs_enabled ? 1 : 0

  replication_group_id       = "${var.project_name}-redis"
  description                = "ReVogue Redis cache"
  engine                     = "redis"
  engine_version             = "7.1"
  node_type                  = var.redis_node_type
  port                       = 6379
  automatic_failover_enabled = true
  multi_az_enabled           = true
  num_cache_clusters         = 2

  subnet_group_name  = aws_elasticache_subnet_group.redis[0].name
  security_group_ids = [aws_security_group.redis[0].id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = false

  tags = {
    Name    = "${var.project_name}-redis"
    Project = var.project_name
  }
}
