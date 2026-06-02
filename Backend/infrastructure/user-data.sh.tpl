#!/bin/bash
set -eux

# Update system packages
yum update -y

# Install Node.js 20 and Git
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git

# Install PM2 globally
npm install -g pm2

# Prepare deployment directory
mkdir -p /opt/revogue/revogue-backend
chown -R ec2-user:ec2-user /opt/revogue

# Create environment helper
cat <<'EOF' >/etc/profile.d/revogue.sh
export PATH=/usr/local/bin:$PATH
EOF
