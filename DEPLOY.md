# 🚀 GitHub Deployment Guide

Your local git repository is ready! Follow these steps to deploy to GitHub:

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `mosquito-game` (or any name you prefer)
4. Description: "A fun mosquito-killing game"
5. Make it **Public** (required for free GitHub Pages)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

## Step 2: Connect and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
cd "/Users/huzefa/Documents/Vibe Coding"
git remote add origin https://github.com/YOUR_USERNAME/mosquito-game.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, select **"main"** branch
5. Click **"Save"**
6. Wait 1-2 minutes for deployment

## Step 4: Access Your Game

Your game will be live at:
```
https://YOUR_USERNAME.github.io/mosquito-game/
```

## 🔄 Future Updates

Whenever you make changes:

```bash
git add .
git commit -m "Your commit message"
git push
```

GitHub Pages will automatically update in 1-2 minutes!

## 📝 Notes

- The game uses localStorage for leaderboard (scores are per-device)
- Audio requires HTTPS (GitHub Pages provides this automatically)
- All your assets (audio, images, animations) are included

## 🎉 You're Done!

Your game is now live on the internet!

