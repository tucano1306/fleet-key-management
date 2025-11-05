# Vercel Environment Variables Setup

## 🔧 Required Environment Variables for Production

Go to your Vercel project dashboard and add these environment variables:

### 1. Database Connection
```
DATABASE_URL
```
**Value:** Your PostgreSQL connection string from `.env` file
```
postgres://fe3fa8d24d071ab359221c7f2eaab708aaf22a653c38f7bbbeba0a63b6a42114:sk_-UdaH6c6wO6Y-regjy8eW@db.prisma.io:5432/postgres?sslmode=require
```

### 2. Session Secret (Generate a new one for production)
```
NEXTAUTH_SECRET
```
**Value:** Generate with this command in terminal:
```bash
openssl rand -base64 32
```
Or use: `your-super-secret-key-minimum-32-characters-long`

### 3. App URL
```
NEXTAUTH_URL
```
**Value:** Your Vercel deployment URL
```
https://app-h1v86myvm-tucano0109-5495s-projects.vercel.app
```

## 📝 Steps to Configure in Vercel

1. Go to https://vercel.com/dashboard
2. Select your project: **app-key**
3. Go to **Settings** → **Environment Variables**
4. Add each variable above:
   - Name: `DATABASE_URL`
   - Value: (paste the connection string)
   - Environment: ✅ Production ✅ Preview ✅ Development
   - Click **Save**
5. Repeat for `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
6. After adding all variables, go to **Deployments**
7. Click **...** on the latest deployment → **Redeploy**

## ✅ Verification

After redeployment:
1. Visit your app URL
2. Try logging in with: `DISPATCH001` / `0000`
3. If it works, database is connected! 🎉

## 🐛 Troubleshooting

**If login fails:**
- Check Vercel logs: Deployments → Latest → Runtime Logs
- Verify `DATABASE_URL` is correct
- Make sure you ran `npx tsx prisma/seed.ts` to populate data

**If build fails:**
- Check that all 3 environment variables are set
- Redeploy after adding variables
