# Complete Deployment Guide

## Where to Host Your Inventory Management System

This guide will walk you through the best options for hosting your inventory management system online.

---

## Recommended Solution: Render (Easiest & Free Tier Available)

### Why Render?
- ✅ Free tier available
- ✅ Easy deployment from GitHub
- ✅ Automatic HTTPS
- ✅ Built-in database hosting
- ✅ No credit card required for free tier

### Cost: FREE (with limitations) or $7-21/month for production

---

## Step-by-Step Deployment to Render

### Part 1: Prepare Your Application

1. **Create a GitHub Account** (if you don't have one)
   - Go to https://github.com
   - Sign up for free

2. **Install Git** on your computer
   - Download from https://git-scm.com
   - Follow installation instructions

3. **Upload Your Code to GitHub**
   ```bash
   cd /Users/francescoassalone/Desktop/inventory-management-system
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   ```

### Part 2: Deploy to Render

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up with your GitHub account

2. **Deploy Backend & Frontend**
   - Follow Render's documentation for Node.js apps
   - Set environment variables as needed

---

## Alternative Hosting Options

### Option 2: Heroku
- Website: https://heroku.com
- Cost: $7/month minimum

### Option 3: DigitalOcean
- Website: https://www.digitalocean.com
- Cost: $5-12/month

### Option 4: Railway
- Website: https://railway.app
- Cost: $5-20/month

---

## Domain Name Registration

### Recommended Registrars:

1. **Namecheap** - https://www.namecheap.com ($8-12/year)
2. **Google Domains** - https://domains.google ($12/year)
3. **Porkbun** - https://porkbun.com ($6-10/year)
4. **GoDaddy** - https://www.godaddy.com ($10-20/year)

---

## Cost Summary

### Budget Option:
- Hosting: $0-7/month
- Domain: $10/year
- **Total: ~$1-8/month**

### Standard Option:
- Hosting: $12-21/month
- Domain: $10/year
- **Total: ~$13-22/month**

---

## Security Checklist

1. Change default admin password
2. Update JWT_SECRET to a strong random value
3. Enable HTTPS (automatic on most platforms)
4. Set up regular database backups

---

## Support

For detailed deployment help:
- Render Documentation: https://render.com/docs
- GitHub Help: https://docs.github.com
