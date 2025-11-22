# Lottie Animations

## How to Add Your Lottie Animation

1. **Get your Lottie JSON file**
   - Export from After Effects using the Bodymovin plugin
   - Or download from LottieFiles.com
   - The file should be a `.json` file

2. **Place the file here**
   - Put your Lottie JSON file in this `animations` folder
   - Example: `animations/mosquito.json`

3. **Update the path in game.js**
   - Open `game.js`
   - Find this line at the top:
     ```javascript
     const LOTTIE_MOSQUITO_PATH = null;
     ```
   - Change it to your file path:
     ```javascript
     const LOTTIE_MOSQUITO_PATH = 'animations/mosquito.json';
     ```

4. **That's it!**
   - The game will automatically use your Lottie animation instead of the default SVG
   - If you set it back to `null`, it will use the default SVG mosquito

## Tips

- Make sure your Lottie animation loops well (set loop in After Effects or LottieFiles)
- The animation will automatically scale with the mosquito size
- Recommended size: around 100x100px or similar to the default mosquito size

