# Bzzzzzz - Mosquito Killing Game

A fun, interactive mosquito-killing game built with HTML, CSS, and JavaScript.

## 🎮 How to Play

1. Enter your name to start
2. Kill as many mosquitoes as possible in 60 seconds
3. Tap/click mosquitoes to eliminate them
4. Don't let mosquitoes reach the other side - you'll lose a life!
5. Try to beat your high score on the leaderboard!

## 📁 Project Structure

```
/
├── index.html          # Main HTML file
├── game.js            # Game logic
├── style.css          # Styling
├── audio/             # Audio files
│   ├── mosquito-buzz.mp3
│   └── mosquito-kill.mp3
├── images/            # Image assets
│   └── mosquito-flying.gif
└── animations/        # Lottie animations (optional)
    └── mosquito.json
```

## 🚀 Deploying Online

### Option 1: GitHub Pages (Free & Easy)

1. **Create a GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/mosquito-game.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Under "Source", select "main" branch
   - Click "Save"
   - Your game will be live at: `https://YOUR_USERNAME.github.io/mosquito-game/`

### Option 2: Netlify (Free & Easy)

1. **Drag and Drop:**
   - Go to [netlify.com](https://www.netlify.com)
   - Sign up/login
   - Drag your project folder to the deploy area
   - Done! Your game is live

2. **Or use Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify deploy
   netlify deploy --prod
   ```

### Option 3: Vercel (Free & Easy)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

### Option 4: Any Web Hosting Service

Upload all files to your web hosting service:
- Upload `index.html`, `game.js`, `style.css` to the root
- Upload `audio/`, `images/`, and `animations/` folders with their contents
- Make sure the folder structure is preserved

## ⚙️ Configuration

Before deploying, check these settings in `game.js`:

```javascript
// Audio files
const AUDIO_BUZZ_PATH = 'audio/mosquito-buzz.mp3';
const AUDIO_KILL_PATH = 'audio/mosquito-kill.mp3';

// GIF (if using)
const MOSQUITO_GIF_PATH = 'images/mosquito-flying.gif';

// Lottie (if using)
const LOTTIE_MOSQUITO_PATH = null;
```

## 📝 Important Notes

- **Leaderboard**: Currently uses browser localStorage (scores are per-device)
- **Audio**: Make sure audio files are included in the `audio/` folder
- **HTTPS**: Required for audio autoplay in most browsers
- **File Size**: Optimize audio/image files for faster loading

## 🛠️ Local Development

Simply open `index.html` in a web browser, or use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## 📄 License

Free to use and modify!

