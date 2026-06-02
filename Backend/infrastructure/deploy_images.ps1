$AWS_ACCOUNT_ID = "687098277128"
$REGION = "us-east-1"
$REPO_PREFIX = "revogue"
$SERVICES_BASE_PATH = "e:\Coding\revogue\Backend\services"

# 1. Authenticate Docker to ECR
Write-Host "Authenticating to ECR..." -ForegroundColor Cyan
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

$services = @("gateway", "frontend", "catalog", "cart", "order", "payment", "notification")

foreach ($svc in $services) {
    Write-Host "`n--- Processing Service: $svc ---" -ForegroundColor Green
    
    $svcPath = Join-Path $SERVICES_BASE_PATH $svc
    $repoUrl = "$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_PREFIX-$svc"
    
    if (Test-Path $svcPath) {
        Push-Location $svcPath
        
        $localImage = "$($REPO_PREFIX)-$($svc):latest"
        $remoteImage = "$($repoUrl):latest"

        Write-Host "Local image: $localImage"
        Write-Host "Remote image: $remoteImage"

        Write-Host "Building image..."
        docker build -t $localImage .

        Write-Host "Tagging image..."
        docker tag $localImage $remoteImage

        Write-Host "Pushing image..."
        docker push $remoteImage
        
        Pop-Location
    } else {
        Write-Warning "Directory not found: $svcPath"
    }
}

Write-Host "`nAll services processed successfully!" -ForegroundColor Cyan
