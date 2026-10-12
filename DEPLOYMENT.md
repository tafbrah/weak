# 🚀 Loopwerk — OVHcloud Deployment Guide

Complete guide to deploy your Loopwerk application self-hosted on **OVHcloud**.

---

## 📋 Architecture

```
┌─────────────────────────────────────────────────┐
│              OVHcloud VPS                        │
│                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────────┐ │
│  │  Nginx   │──▶│ Next.js  │──▶│ PostgreSQL   │ │
│  │  :80/443 │   │  :3000   │   │   :5432      │ │
│  └──────────┘   └──────────┘   └──────────────┘ │
│       │                                          │
│       ▼                                          │
│  ┌──────────┐                                    │
│  │ Certbot  │  (Let's Encrypt SSL)               │
│  └──────────┘                                    │
└─────────────────────────────────────────────────┘
```

---

## Step 1: Create an OVHcloud VPS

1. Go to [OVHcloud](https://www.ovhcloud.com) and sign in
2. Navigate to **VPS** → **Order a VPS**
3. Choose a plan:
   - **VPS Starter** (1 vCore, 2GB RAM, 40GB) — for testing
   - **VPS Essential** (2 vCore, 4GB RAM, 80GB) — recommended for production
4. Choose **Ubuntu 22.04** as the operating system
5. Choose a datacenter region (e.g., **GRA** for Europe)
6. Complete the order
7. Note your **server IP address** (you'll receive it by email)

---

## Step 2: Configure DNS

1. In OVHcloud, go to **Web Cloud** → **Domains** → your domain
2. Go to the **DNS Zone** tab
3. Add DNS records:
   - **Type:** `A` | **Name:** `@` | **Target:** `YOUR_SERVER_IP`
   - **Type:** `A` | **Name:** `www` | **Target:** `YOUR_SERVER_IP`
4. Wait 5–60 minutes for DNS propagation

---

## Step 3: Connect to Your VPS

```bash
ssh root@YOUR_SERVER_IP
```

Enter the password you received by email.

### (Recommended) Create a non-root user

```bash
adduser deploy
usermod -aG sudo deploy
su - deploy
```

---

## Step 4: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and back in for the group to take effect
exit
ssh deploy@YOUR_SERVER_IP
```

Verify:
```bash
docker --version
docker compose version
```

---

## Step 5: Upload Your Project

### Option A: Using Git
```bash
sudo apt install git -y
git clone YOUR_REPO_URL ~/loopwerk
cd ~/loopwerk
```

### Option B: Using scp
```bash
# From your local machine:
scp -r ./loopwerk deploy@YOUR_SERVER_IP:~/loopwerk
```

---

## Step 6: Configure Environment Variables

```bash
cd ~/loopwerk
cp .env.example .env
nano .env
```

Fill in these values:
```bash
POSTGRES_PASSWORD=CHANGE_ME_strong_password
SESSION_SECRET=CHANGE_ME_long_random_secret_string
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=CHANGE_ME_admin_password
NEXT_PUBLIC_SITE_URL=https://yourdomain.ovh.net
```

Generate strong secrets:
```bash
openssl rand -hex 32   # Use this for SESSION_SECRET
openssl rand -hex 16   # Use this for POSTGRES_PASSWORD
```

---

## Step 7: Configure Nginx

```bash
nano nginx.conf
```

Replace `YOUR_DOMAIN` with your domain (in **3 places**):
```nginx
server_name yourdomain.ovh.net www.yourdomain.ovh.net;
```

---

## Step 8: Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

This will:
1. Build the Next.js app in a Docker container
2. Start PostgreSQL, the app, and Nginx
3. Run database migrations
4. Seed initial data

Verify it's running:
```bash
curl http://localhost:3000/api/health   # Should return health JSON
docker compose ps                        # All services should be "running"
```

---

## Step 9: Set Up SSL (Let's Encrypt)

First, make sure your domain DNS points to the server (Step 2).

```bash
chmod +x setup-ssl.sh
./setup-ssl.sh yourdomain.ovh.net
```

Then edit `nginx.conf`:
1. Replace `YOUR_DOMAIN` with your domain
2. Uncomment the **HTTPS server block**
3. Uncomment the **HTTP → HTTPS redirect** inside the HTTP block

Restart Nginx:
```bash
docker compose restart nginx
```

Your site is now live at `https://yourdomain.ovh.net` 🎉

---

## Step 10: Update `nginx.conf` SSL paths

Make sure the SSL certificate paths in `nginx.conf` match:
```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.ovh.net/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.ovh.net/privkey.pem;
```

---

## 🔐 Access Your Application

- **Website:** `https://yourdomain.ovh.net`
- **Admin console:** `https://yourdomain.ovh.net/admin/login`
- **Admin credentials:** as set in `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)

---

## 🛠️ Useful Commands

```bash
# View logs
docker compose logs -f app
docker compose logs -f db
docker compose logs -f nginx

# Restart services
docker compose restart
docker compose restart app

# Stop everything
docker compose down

# Rebuild after code changes
docker compose up -d --build

# Run database migrations
docker compose exec app npx drizzle-kit push

# Access PostgreSQL
docker compose exec db psql -U postgres -d app_db

# Backup database
docker compose exec db pg_dump -U postgres app_db > backup.sql

# Restore database
docker compose exec -T db psql -U postgres app_db < backup.sql

# Update code from Git and redeploy
git pull && docker compose up -d --build
```

---

## 🔄 Automatic SSL Renewal

The `certbot` container automatically renews the SSL certificate every 12 hours (checks if renewal is needed). Test renewal:
```bash
docker compose run --rm --entrypoint "certbot renew --dry-run" certbot
```

---

## 🔒 Security Checklist

- [ ] Change `POSTGRES_PASSWORD` to a strong random password
- [ ] Change `SESSION_SECRET` to a long random string
- [ ] Change `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- [ ] Set up SSL (HTTPS)
- [ ] Point DNS to your server
- [ ] (Optional) Set up a firewall: `sudo ufw allow 80,443,22/tcp && sudo ufw enable`
- [ ] Set up regular database backups

---

## 🐛 Troubleshooting

**App not loading:**
```bash
docker compose logs app
docker compose ps
```

**Database connection errors:**
```bash
docker compose logs db
docker compose exec db pg_isready -U postgres
```

**SSL not working:**
```bash
docker compose logs nginx
docker compose logs certbot
```

**Rebuild everything:**
```bash
docker compose down
docker compose up -d --build
```

---

## 📁 Project Structure

```
loopwerk/
├── Dockerfile              # Next.js app container
├── docker-compose.yml      # App + DB + Nginx + Certbot
├── nginx.conf              # Nginx reverse proxy config
├── .env                    # Environment variables (create from .env.example)
├── .env.example            # Template
├── deploy.sh               # Deployment script
├── setup-ssl.sh            # SSL setup script
├── .dockerignore           # Files to exclude from Docker build
└── src/                    # Application source code
```

---

## 🎉 You're Done!

Your Loopwerk application is now self-hosted on OVHcloud with:
- ✅ Next.js application
- ✅ PostgreSQL database
- ✅ Nginx reverse proxy
- ✅ Free Let's Encrypt SSL
- ✅ Automatic SSL renewal

Access it at `https://yourdomain.ovh.net` 🚀
