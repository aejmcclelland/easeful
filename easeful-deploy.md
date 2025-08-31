# Easeful Deployment Guide

This document describes how to deploy the Easeful application with:
- **Frontend (Next.js client)** on **Vercel**
- **Backend (Express server)** on **Render**
- **Database** on **MongoDB Atlas**

---

## 1. Prepare Repositories

- Ensure your project is split into two directories in your repo:
  - `taskmanager-client/` → Next.js frontend
  - `taskmanager-server/` → Express backend

Push to GitHub so both Vercel and Render can import.

---

## 2. MongoDB Atlas Setup

1. Create a new cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Add a Database User with username + password.
3. Whitelist your IP or choose `0.0.0.0/0` (dev only).
4. Copy your connection string (`MONGO_URI`). Example:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/easeful
```

---

## 3. Deploy Backend (Render)

1. Go to [Render](https://render.com) → New Web Service.
2. Connect to your GitHub repo.
3. Choose `taskmanager-server/` as the root folder.
4. Configure service:
   - Runtime: **Node**
   - Build Command: `pnpm install`
   - Start Command: `node index.js` (or `pnpm start`)
5. Add environment variables in **Render Dashboard**:
   ```env
   NODE_ENV=production
   MONGO_URI=your_atlas_connection_string
   JWT_SECRET=your_secret_here
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_KEY=...
   CLOUDINARY_SECRET=...
   FILE_UPLOAD_LIMIT=5000000
   ```
6. Deploy → Render gives you a public API URL like:
   ```
   https://easeful-api.onrender.com
   ```

---

## 4. Deploy Frontend (Vercel)

1. Go to [Vercel](https://vercel.com) → New Project.
2. Select the same GitHub repo.
3. Set **Root Directory** to `taskmanager-client/`.
4. Framework: **Next.js** (auto-detected).
5. Add environment variables in **Vercel Dashboard** → Settings → Environment Variables:
   ```env
   NEXT_PUBLIC_API_BASE=https://easeful-api.onrender.com
   ```
6. Deploy → Vercel gives you a public URL like:
   ```
   https://easeful.vercel.app
   ```

---

## 5. CORS & Cookies

On the **Express server** (`index.js`):
```js
app.use(cors({
  origin: ["http://localhost:3001", "https://easeful.vercel.app"],
  credentials: true,
}));
```

And when setting cookies:
```js
const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
};
```

---

## 6. Testing Deployment

- Visit your Vercel site → login/register should work.
- Tasks API should load only when logged in.
- Image uploads go to Cloudinary.

---

## 7. Troubleshooting

- **401 errors:** Ensure cookies are being sent. Check `credentials: "include"` on fetch.
- **CORS issues:** Verify the exact Vercel domain is in `origin` array.
- **500 errors:** Use Render logs to debug Express crashes.
- **Atlas connection error:** Ensure Render’s IPs are whitelisted in Atlas.

---

## ✅ Deployment Complete

- Frontend: `https://easeful.vercel.app`
- Backend API: `https://easeful-api.onrender.com`
- Database: MongoDB Atlas cluster
