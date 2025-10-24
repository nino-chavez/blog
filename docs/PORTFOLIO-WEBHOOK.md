# Portfolio Rebuild Webhook

This blog automatically triggers a rebuild of **nino-chavez-website** when you publish new posts.

## How It Works

1. You publish a new post to signal-dispatch-blog
2. When you deploy to Vercel, the build process runs
3. At the end of the build, `scripts/trigger-rebuild.ts` executes
4. It calls the Vercel deploy hook for nino-chavez-website
5. Your portfolio rebuilds and displays the new post

## Quick Setup

### 1. Get Webhook URL from Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select **nino-chavez-website** project
3. Navigate to **Settings** → **Git** → **Deploy Hooks**
4. Create hook: `blog-post-published` targeting `main` branch
5. Copy the webhook URL

### 2. Add to Environment Variables

**Local development:**
```bash
# Create .env file (already in .gitignore)
cp .env.example .env

# Add your webhook URL
PORTFOLIO_REBUILD_WEBHOOK_URL=https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_ID/YOUR_TOKEN
```

**Vercel deployment:**
1. Go to signal-dispatch-blog project in Vercel
2. **Settings** → **Environment Variables**
3. Add `PORTFOLIO_REBUILD_WEBHOOK_URL` with the webhook URL
4. Redeploy to pick up the new environment variable

### 3. Test It

**Option A: Trigger manually**
```bash
npm run trigger-rebuild
```

**Option B: Deploy blog**
```bash
git add .
git commit -m "Add new post"
git push
```

Watch your nino-chavez-website deployments in Vercel - you should see a new deployment triggered by "Deploy Hook".

## Troubleshooting

### Webhook not triggering
- Check environment variable is set in Vercel
- Verify webhook URL format: `https://api.vercel.com/v1/integrations/deploy/...`
- Check build logs for `[trigger-rebuild]` messages

### Portfolio not showing new posts
- Wait 2-3 minutes for portfolio build to complete
- Check `PUBLIC_BLOG_ORIGIN` in portfolio: `https://blog.ninochavez.co`
- Verify manifest is accessible: `https://blog.ninochavez.co/manifest.json`

### Build failing
- Webhook failures won't fail your blog build (by design)
- Check portfolio deployment logs in Vercel for actual errors

## Full Documentation

For complete setup instructions and advanced options, see:
**[WEBHOOK-SETUP.md](../../nino-chavez-website/docs/WEBHOOK-SETUP.md)** in the portfolio repo

## Files Added

- `scripts/trigger-rebuild.ts` - Webhook trigger script
- `.env.example` - Environment variable template
- `docs/PORTFOLIO-WEBHOOK.md` - This file

## Build Script

The build script in `package.json` now includes the webhook trigger:

```json
"build": "... && tsx scripts/trigger-rebuild.ts"
```

The trigger runs **after** all other build steps, ensuring your manifest is generated before triggering the portfolio rebuild.
