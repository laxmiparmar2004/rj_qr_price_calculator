# Vercel Deployment Setup

This guide explains how to deploy this project to Vercel and configure environment variables.

## Quick Start

### 1. Connect Your Repository to Vercel
- Go to [vercel.com](https://vercel.com)
- Sign in with GitHub, GitLab, or Bitbucket
- Click "Add New" → "Project"
- Import your repository from your Git provider
- Vercel will automatically detect the project as a Vite app

### 2. Configure Environment Variables in Vercel Dashboard

**Option A: Using Vercel Dashboard (Recommended for Secrets)**
1. After importing the project, go to "Settings" → "Environment Variables"
2. Add the following variables:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://azszifsqgjvnlryopphf.supabase.co`
   - **Environments:** Select Production, Preview, and Development as needed

3. Add another variable:
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6c3ppZnNxZ2p2bmxyeW9wcGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDY1NTIsImV4cCI6MjA5NTAyMjU1Mn0.xGuP3Z9BRQS_gEj_H0buFsTu2v042HCApgIP8PyuR3k`
   - **Environments:** Select Production, Preview, and Development as needed

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### 3. Build Settings

The project is already configured for Vercel:
- **Framework:** Vite (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

No additional configuration needed in `vercel.json` as the default Vite settings work perfectly.

## Environment Variables Reference

| Variable | Purpose | Where to Get |
|----------|---------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | [Supabase Dashboard](https://app.supabase.com) → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | [Supabase Dashboard](https://app.supabase.com) → Settings → API → anon key |

## Local Development

Create a `.env.local` file with these variables (already done):
```
VITE_SUPABASE_URL=https://azszifsqgjvnlryopphf.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Production Deployment

Create a `.env.production` file (already created):
- Committed to repo for non-secret configuration
- Variables defined here are used during `npm run build` and runtime

## Security Notes

⚠️ **Important:** The `VITE_SUPABASE_ANON_KEY` is exposed in the frontend code intentionally (it's an anon key with limited permissions). However:
- Never commit `.env.local` to version control
- The `.env.production` file contains the same public values
- Set stricter Row Level Security (RLS) policies in Supabase for security
- Use environment variables in Vercel Dashboard for sensitive production secrets

## Deployment

Once configured, deploy by:
1. Pushing to your main branch
2. Or clicking "Deploy" in the Vercel Dashboard
3. Vercel will automatically:
   - Install dependencies
   - Build the project
   - Deploy to a production URL

## Troubleshooting

**Build fails with "Supabase credentials not configured"**
- Verify environment variables are set in Vercel Dashboard
- Check variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Redeploy after setting variables

**Environment variables not showing in app**
- Vite only includes variables prefixed with `VITE_`
- Variables are baked into the build, not loaded at runtime
- For runtime configuration, use `import.meta.env` in the code

**CORS errors from Supabase**
- Verify your deployed URL is added to Supabase allowed URLs
- Go to Supabase Dashboard → Project Settings → API → CORS allowed origins
- Add your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

## Next Steps

1. ✅ Commit `.env.production` to your repository
2. Push your code to GitHub/GitLab/Bitbucket
3. Import the project in Vercel Dashboard
4. Configure environment variables in Vercel Settings
5. Deploy!

For more help: https://vercel.com/docs/environment-variables
