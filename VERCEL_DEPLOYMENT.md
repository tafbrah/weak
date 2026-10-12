# ☁️ Loopwerk — Vercel Deployment Guide (Free)

Deploy your Loopwerk application to **Vercel** (free) with a free **Neon PostgreSQL** database.

**Total cost: $0/month** 🎉

---

## 📋 Architecture

```
┌─────────────────────────────────────┐
│            Vercel (Free)             │
│  ┌──────────────────────────────┐   │
│  │   Next.js App (Serverless)   │   │
│  │   yourapp.vercel.app         │   │
│  └──────────────┬───────────────┘   │
└─────────────────┼───────────────────┘
                  │ DATABASE_URL
                  ▼
┌─────────────────────────────────────┐
│      Neon PostgreSQL (Free)          │
│   Neon Serverless Postgres           │
└─────────────────────────────────────┘
```

---

## Step 1: Create a Free Neon PostgreSQL Database

Neon provides a free serverless PostgreSQL database.

1. Go to [https://neon.tech](https://neon.tech) and sign up (free with GitHub/Google)
2. Click **"Create Project"**
3. Choose:
   - **Project name:** `loopwerk`
   - **Database name:** `app_db`
   - **Region:** `eu-central-1` (Frankfurt) or closest to you
4. Click **"Create Project"**
5. Copy the **connection string** — it looks like:
   ```
   postgresql://username:password@ep-xxxxx.eu-central-1.aws.neon.tech/app_db?sslmode=require
   ```

> 💡 **Save this connection string** — you'll need it in Step 3.

---

## Step 2: Push Your Code to GitHub

1. Create a repository on [GitHub](https://github.com)
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/loopwerk.git
   git push -u origin main
   ```

> ⚠️ **Important:** Make sure `.env` is in `.gitignore` (it should be). Never commit `.env` to GitHub.

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [https://vercel.com](https://vercel.com) and sign up (free with GitHub)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (`loopwerk`)
4. Vercel auto-detects **Next.js** — keep the defaults:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
5. **Add Environment Variables** (see Step 4 below)
6. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## Step 4: Set Environment Variables

In Vercel: **Project Settings** → **Environment Variables**

Add these variables (apply to **Production**, **Preview**, and **Development**):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string (from Step 1) |
| `SESSION_SECRET` | A long random string (see below) |
| `ADMIN_EMAIL` | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Your admin password |
| `NEXT_PUBLIC_SITE_URL` | `https://yourapp.vercel.app` (your Vercel URL) |

**Generate a SESSION_SECRET:**
```bash
openssl rand -hex 32
```

> 💡 After setting env vars, **redeploy** (Vercel auto-redeploys on env changes, or manually redeploy).

---

## Step 5: Run Database Migrations & Seed

Since Vercel is serverless, you need to run migrations. You have two options:

### Option A: Run locally (Recommended for first time)

With your Neon `DATABASE_URL` set locally in `.env`:
```bash
# Point .env DATABASE_URL to your Neon URL
npx drizzle-kit push
npx tsx src/db/seed.ts
```

### Option B: Run via Vercel (one-time)

Add a temporary script or use Vercel's build to run migrations. The easiest is to run locally (Option A).

> 💡 **Neon connection note:** Neon may require `?sslmode=require` in the connection string. Make sure it's included.

---

## Step 6: Configure Your Custom Domain (Optional)

1. In Vercel: **Project Settings** → **Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Update your domain's DNS:
   - **Type:** `A` | **Name:** `@` | **Value:** `76.76.21.21`
   - **Type:** `CNAME` | **Name:** `www` | **Value:** `cname.vercel-dns.com`
4. Vercel auto-provisions **free SSL** (HTTPS)
5. Update `NEXT_PUBLIC_SITE_URL` to your domain

---

## 🎉 You're Done!

Your app is live at:
- **Vercel URL:** `https://yourapp.vercel.app`
- **Custom domain:** `https://yourdomain.com` (if configured)
- **Admin console:** `https://yourapp.vercel.app/admin/login`

---

## 🔐 Access Your App

- **Website:** `https://yourapp.vercel.app`
- **Admin console:** `https://yourapp.vercel.app/admin/login`
- **Credentials:** `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your Vercel env vars

---

## 🆓 Free Tier Limits

| Service | Free Tier |
|---------|-----------|
| **Vercel** | 100GB bandwidth/month, unlimited sites |
| **Neon PostgreSQL** | 500MB storage, 191 compute hours/month |

This is plenty for a small-to-medium site.

---

## 🔄 Automatic Deployments

Every `git push` to your GitHub repo automatically redeploys on Vercel:
```bash
git add .
git commit -m "Update"
git push
```

Preview deployments are created for every branch/PR.

---

## 🛠️ Useful Commands

```bash
# Deploy via CLI
vercel --prod

# View logs
vercel logs yourapp.vercel.app

# Run migrations locally (against Neon)
DATABASE_URL="your-neon-url" npx drizzle-kit push

# Seed database locally
DATABASE_URL="your-neon-url" npx tsx src/db/seed.ts

# Access Neon database
psql "your-neon-connection-string"
```

---

## ⚠️ Important Notes for Vercel

### Serverless Considerations
- Vercel functions are **serverless** — they scale automatically
- Database connections are pooled by Neon (no connection limits to worry about)
- Sessions use **signed tokens** (no server-side session storage needed) ✅

### Environment Variables
- Set all env vars in **Vercel Dashboard** (not in code)
- `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`

### Neon Cold Starts
- Neon may have brief cold starts on the free tier
- This is normal and resolves quickly

---

## 🐛 Troubleshooting

**Database connection errors:**
- Verify `DATABASE_URL` is correct in Vercel env vars
- Ensure `?sslmode=require` is in the Neon connection string
- Make sure you ran migrations (Step 5)

**Build errors:**
- Check Vercel build logs: **Deployments** → click deployment → **Build Logs**

**Admin login not working:**
- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel env vars
- Make sure `SESSION_SECRET` is set

**Site not loading:**
- Check Vercel deployment status
- Verify the build succeeded

---

## 📁 Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Random string for signing session tokens |
| `ADMIN_EMAIL` | ✅ | Admin console email |
| `ADMIN_PASSWORD` | ✅ | Admin console password |
| `NEXT_PUBLIC_SITE_URL` | ⚠️ | Your site URL (for canonical/OG) |

---

## 🎊 Summary

You now have Loopwerk deployed on:
- ✅ **Vercel** (free hosting, auto-deploys, free SSL)
- ✅ **Neon PostgreSQL** (free database)
- ✅ **Total cost: $0/month**

Access it at `https://yourapp.vercel.app` 🚀
