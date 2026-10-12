#!/bin/bash
# ==========================================
# Loopwerk — SSL Setup Script (Let's Encrypt)
# ==========================================
# Sets up a free Let's Encrypt SSL certificate for your domain.
# Prerequisites: Your domain DNS must point to this server's IP.
#
# Usage: ./setup-ssl.sh yourdomain.com
# ==========================================

set -e

DOMAIN=$1

if [ -z "$DOMAIN" ]; then
    echo "❌ Usage: ./setup-ssl.sh yourdomain.com"
    exit 1
fi

echo "=========================================="
echo "  Setting up SSL for: $DOMAIN"
echo "=========================================="

# Create certbot directories
mkdir -p certbot/conf certbot/www

# Download recommended TLS parameters
curl -s https://ssl-config.mozilla.org/ffdhe4096.txt > certbot/conf/options-ssl-nginx.conf 2>/dev/null || \
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > certbot/conf/options-ssl-nginx.conf
curl -s https://ssl-config.mozilla.org/ffdhe4096.txt > certbot/conf/ssl-dhparams.pem 2>/dev/null || true

# Request certificate
echo ""
echo "🔒 Requesting Let's Encrypt certificate..."
docker compose run --rm --entrypoint "\
  certbot certonly --webroot --webroot-path=/var/www/certbot \
  --email admin@$DOMAIN --agree-tos --no-eff-email \
  -d $DOMAIN -d www.$DOMAIN" certbot

echo ""
echo "✅ SSL certificate obtained!"
echo ""
echo "Next steps:"
echo "  1. Edit nginx.conf:"
echo "     - Replace YOUR_DOMAIN with: $DOMAIN"
echo "     - Uncomment the HTTPS server block"
echo "     - Uncomment the HTTP->HTTPS redirect"
echo "  2. Restart nginx: docker compose restart nginx"
echo "=========================================="
