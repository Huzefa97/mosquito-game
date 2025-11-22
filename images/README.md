# Mosquito GIF

## How to Add Your Mosquito GIF

1. **Get your GIF file**
   - Create or download a flying mosquito GIF
   - Make sure it loops smoothly
   - Recommended size: around 40x40px to 100x100px

2. **Place the file here**
   - Put your GIF file in this `images` folder
   - Example: `images/mosquito.gif`

3. **Update the path in game.js**
   - Open `game.js`
   - Find this line at the top:
     ```javascript
     const MOSQUITO_GIF_PATH = null;
     ```
   - Change it to your file path:
     ```javascript
     const MOSQUITO_GIF_PATH = 'images/mosquito.gif';
     ```

4. **Priority order**
   - If `LOTTIE_MOSQUITO_PATH` is set, it uses Lottie (highest priority)
   - Else if `MOSQUITO_GIF_PATH` is set, it uses GIF
   - Else it uses the default SVG mosquito (lowest priority)

## Tips

- Make sure your GIF loops seamlessly
- The GIF will automatically scale with the mosquito size variation
- Transparent background works best
- Keep file size reasonable for better performance

