# Extends GitHub Actions role (defined in iam.tf) with ECR + ECS deploy — does not modify iam.tf

data "aws_iam_policy_document" "github_ecs_deploy" {
  count = local.ecs_enabled && var.enable_github_oidc ? 1 : 0

  statement {
    sid    = "ECRPushPull"
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "ECSDeploy"
    effect = "Allow"
    actions = [
      "ecs:UpdateService",
      "ecs:DescribeServices",
      "ecs:DescribeTaskDefinition",
      "ecs:RegisterTaskDefinition",
      "ecs:DescribeClusters",
    ]
    resources = ["*"]
  }

  statement {
    sid     = "PassRoles"
    effect  = "Allow"
    actions = ["iam:PassRole"]
    resources = [
      aws_iam_role.ecs_execution[0].arn,
      aws_iam_role.ecs_task[0].arn,
    ]
    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_policy" "github_ecs_deploy" {
  count = local.ecs_enabled && var.enable_github_oidc ? 1 : 0

  name        = "${var.project_name}-github-ecs-deploy"
  description = "GitHub Actions: push ECR images and deploy ECS services"
  policy      = data.aws_iam_policy_document.github_ecs_deploy[0].json
}

resource "aws_iam_role_policy_attachment" "github_ecs_deploy" {
  count = local.ecs_enabled && var.enable_github_oidc ? 1 : 0

  role       = aws_iam_role.github_actions[0].name
  policy_arn = aws_iam_policy.github_ecs_deploy[0].arn
}
