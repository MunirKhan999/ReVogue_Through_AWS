# AWS Resources and Workflow Overview

This document summarizes all AWS resources used in the project and describes the workflow and data flow between them. Use this as a reference for building a draw.io architecture diagram.

---

## AWS Resources Used

### Networking
- **VPC**: Isolated network for all resources
- **Public Subnets**: For ALB, NAT Gateway
- **Private Subnets**: For ECS tasks, RDS, ElastiCache
- **Internet Gateway**: Allows internet access for public subnets
- **NAT Gateway**: Allows private subnets to access the internet
- **Route Tables**: Public/private routing

### Compute & Containers
- **ECS Cluster (Fargate)**: Runs all microservices as containers
- **ECS Task Definitions & Services**: One per microservice (gateway, frontend, catalog, cart, order, payment, notification)

### Load Balancing & API
- **Application Load Balancer (ALB)**: Public entrypoint, routes traffic to ECS services
- **Target Groups & Listeners**: One per microservice, path-based routing
- **API Gateway (HTTP API v2)**: (Optional) Public API entrypoint, can route to ALB via VPC Link
- **VPC Link**: Connects API Gateway to ALB

### Storage & Database
- **RDS (PostgreSQL)**: Main relational database
- **ElastiCache (Redis)**: Caching/session store for microservices
- **S3**: Static file storage (frontend build, assets)

### CDN & Auth
- **CloudFront**: CDN for S3-hosted frontend
- **Cognito**: User authentication (sign-up, sign-in, JWT)

### IAM & Security
- **IAM Roles**: ECS execution/task roles, ALB/ECS/Redis security groups
- **Security Groups**: For ALB, ECS, RDS, Redis

### CI/CD & Observability
- **ECR**: Container image registry (one repo per microservice)
- **CloudWatch Log Groups**: Logging for ECS, ALB, API Gateway
- **Cloud Map**: Service discovery for ECS
- **GitHub Actions**: CI/CD pipeline (build, push, deploy)

---

## Workflow/Data Flow

1. **User** accesses the app via browser.
2. **CloudFront** serves static frontend from **S3**.
3. User signs in via **Cognito** (Amplify SDK in frontend).
4. Frontend calls **API Gateway** or **ALB** (public endpoint).
5. **ALB** routes requests to the correct **ECS service** (microservice) based on path.
6. **ECS service** (e.g., gateway, catalog, cart, etc.):
    - Reads/writes data from **RDS** (PostgreSQL)
    - Uses **ElastiCache (Redis)** for caching/session
    - Discovers other services via **Cloud Map**
    - Logs to **CloudWatch**
7. **ECS tasks** pull images from **ECR** (built/pushed by GitHub Actions).
8. **IAM roles** and **security groups** enforce least-privilege and network access.
9. **GitHub Actions** automates build, test, image push, and deploy steps.

---

## Example Diagram Flow (for draw.io)

- User → CloudFront → S3 (static frontend)
- User → Cognito (auth)
- User → ALB/API Gateway → ECS (microservices)
- ECS → RDS (PostgreSQL)
- ECS → ElastiCache (Redis)
- ECS ↔ Cloud Map (service discovery)
- ECS → CloudWatch (logs)
- ECS → ECR (pull images)
- GitHub Actions → ECR (push images)
- GitHub Actions → ECS (deploy)

---

**Tip:** Use different colors/shapes for each AWS service in draw.io. Show arrows for data flow and label each connection (e.g., HTTPS, JWT, SQL, etc.).
