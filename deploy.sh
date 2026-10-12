#!/bin/bash
# ==========================================
# Loopwerk — OVHcloud Deployment Script
# ==========================================
# Deploys the application on an OVHcloud VPS using Docker.
# Run this on the OVHcloud VPS after installing Docker.
#
# Usage: ./deploy.sh
# ==========================================

set -e

echo "=========================================="
echo "  Loopwerk — OVHcloud Deployment"
echo "=========================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Copy .env.example to .env and fill in the values:"
    echo "   cp .env.example .env"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Install Docker first:"
    echo "   curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not found. Install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose detected"
echo ""

echo "🔨 Building and starting containers..."
echo "   (db → migrate → seed → app → nginx)"
docker compose up -d --build

echo ""
echo "⏳ Waiting for services to start..."
sleep 8

echo ""
echo "📊 Service status:"
docker compose ps

echo ""
echo "=========================================="
echo "  ✅ Deployment complete!"
echo "=========================================="
echo ""
echo "  Application: http://localhost:3000"
echo "  Admin login: /admin/login"
echo ""
echo "  Admin credentials: (as set in .env)"
echo ""
echo "  Next steps:"
echo "    1. Point your domain DNS to this server's IP"
echo "    2. Update nginx.conf with your domain (3 places)"
echo "    3. Set up SSL: ./setup-ssl.sh yourdomain.com"
echo "    4. Uncomment HTTPS in nginx.conf, then:"
echo "       docker compose restart nginx"
echo "=========================================="
