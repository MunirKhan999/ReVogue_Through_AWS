# Dedicated VPC for ECS microservices (legacy EC2/RDS remain on local.vpc_id until migrated)

resource "aws_vpc" "main" {
  count = local.ecs_enabled ? 1 : 0

  cidr_block           = var.ecs_vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name    = "${var.project_name}-vpc"
    Project = var.project_name
  }
}

resource "aws_internet_gateway" "ecs" {
  count = local.ecs_enabled ? 1 : 0

  vpc_id = aws_vpc.main[0].id

  tags = {
    Name    = "${var.project_name}-igw"
    Project = var.project_name
  }
}

resource "aws_subnet" "public" {
  count = local.ecs_enabled ? length(local.azs) : 0

  vpc_id                  = aws_vpc.main[0].id
  cidr_block              = var.ecs_public_subnet_cidrs[count.index]
  availability_zone       = local.azs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name    = "${var.project_name}-public-${local.azs[count.index]}"
    Project = var.project_name
    Tier    = "public"
  }
}

resource "aws_subnet" "private" {
  count = local.ecs_enabled ? length(local.azs) : 0

  vpc_id            = aws_vpc.main[0].id
  cidr_block        = var.ecs_private_subnet_cidrs[count.index]
  availability_zone = local.azs[count.index]

  tags = {
    Name    = "${var.project_name}-private-${local.azs[count.index]}"
    Project = var.project_name
    Tier    = "private"
  }
}

resource "aws_eip" "nat" {
  count = local.ecs_enabled ? 1 : 0

  domain = "vpc"

  tags = {
    Name    = "${var.project_name}-nat-eip"
    Project = var.project_name
  }

  depends_on = [aws_internet_gateway.ecs]
}

resource "aws_nat_gateway" "ecs" {
  count = local.ecs_enabled ? 1 : 0

  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name    = "${var.project_name}-nat"
    Project = var.project_name
  }
}

resource "aws_route_table" "public" {
  count = local.ecs_enabled ? 1 : 0

  vpc_id = aws_vpc.main[0].id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.ecs[0].id
  }

  tags = {
    Name    = "${var.project_name}-public-rt"
    Project = var.project_name
  }
}

resource "aws_route_table" "private" {
  count = local.ecs_enabled ? length(local.azs) : 0

  vpc_id = aws_vpc.main[0].id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.ecs[0].id
  }

  tags = {
    Name    = "${var.project_name}-private-rt-${local.azs[count.index]}"
    Project = var.project_name
  }
}

resource "aws_route_table_association" "public" {
  count = local.ecs_enabled ? length(local.azs) : 0

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public[0].id
}

resource "aws_route_table_association" "private" {
  count = local.ecs_enabled ? length(local.azs) : 0

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Security groups
resource "aws_security_group" "alb_public" {
  count = local.ecs_enabled ? 1 : 0

  name        = "${var.project_name}-alb-public-sg"
  description = "Public ALB for API Gateway / internet"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-alb-public-sg"
    Project = var.project_name
  }
}

resource "aws_security_group" "alb_internal" {
  count = local.ecs_enabled ? 1 : 0

  name        = "${var.project_name}-alb-internal-sg"
  description = "Internal ALB for ECS microservices"
  vpc_id      = aws_vpc.main[0].id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-alb-internal-sg"
    Project = var.project_name
  }
}

resource "aws_security_group" "ecs_tasks" {
  count = local.ecs_enabled ? 1 : 0

  name        = "${var.project_name}-ecs-tasks-sg"
  description = "ECS Fargate microservices"
  vpc_id      = aws_vpc.main[0].id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-ecs-tasks-sg"
    Project = var.project_name
  }
}

resource "aws_security_group_rule" "alb_internal_from_ecs" {
  count = local.ecs_enabled ? 1 : 0

  type                     = "ingress"
  from_port                = 0
  to_port                  = 65535
  protocol                 = "tcp"
  security_group_id        = aws_security_group.alb_internal[0].id
  source_security_group_id = aws_security_group.ecs_tasks[0].id
}

resource "aws_security_group_rule" "alb_internal_from_public_alb" {
  count = local.ecs_enabled ? 1 : 0

  type                     = "ingress"
  from_port                = 80
  to_port                  = 80
  protocol                 = "tcp"
  security_group_id        = aws_security_group.alb_internal[0].id
  source_security_group_id = aws_security_group.alb_public[0].id
}

resource "aws_security_group_rule" "ecs_tasks_from_internal_alb" {
  count = local.ecs_enabled ? 1 : 0

  type                     = "ingress"
  from_port                = 0
  to_port                  = 65535
  protocol                 = "tcp"
  security_group_id        = aws_security_group.ecs_tasks[0].id
  source_security_group_id = aws_security_group.alb_internal[0].id
}

resource "aws_security_group_rule" "ecs_tasks_from_vpc" {
  count = local.ecs_enabled ? 1 : 0

  type              = "ingress"
  from_port         = 0
  to_port           = 65535
  protocol          = "tcp"
  security_group_id = aws_security_group.ecs_tasks[0].id
  cidr_blocks       = [var.ecs_vpc_cidr]
}

resource "aws_security_group" "vpc_link" {
  count = local.ecs_enabled ? 1 : 0

  name        = "${var.project_name}-vpc-link-sg"
  description = "API Gateway VPC Link ENIs"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.ecs_vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-vpc-link-sg"
    Project = var.project_name
  }
}

resource "aws_security_group_rule" "rds_from_ecs" {
  count = local.ecs_enabled && var.rds_allow_ecs_access ? 1 : 0

  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.ecs_tasks[0].id
  description              = "PostgreSQL from ECS (cross-VPC if legacy RDS)"
}
