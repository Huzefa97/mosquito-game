# Audio Files

Place your audio files in this directory:

## Required Files:

1. **mosquito-buzz.mp3** (or .wav, .ogg)
   - The buzz sound that plays for each mosquito
   - Should be a looping sound
   - Volume will be automatically adjusted based on mosquito's distance from center

2. **mosquito-kill.mp3** (or .wav, .ogg)
   - Sound effect played when a mosquito is killed
   - Short sound effect (not looping)

## File Formats Supported:
- MP3
- WAV
- OGG

## How It Works:

- **Buzz Sound**: Each mosquito gets its own buzz audio that:
  - Starts faint when the mosquito is at the edge of the screen
  - Gets louder as the mosquito approaches the center
  - Is loudest when the mosquito is in the center of the screen
  - Automatically stops when the mosquito is killed or escapes

- **Kill Sound**: Plays once when you successfully kill a mosquito

## Configuration:

The audio file paths are configured in `game.js` at the top:
```javascript
const AUDIO_BUZZ_PATH = 'audio/mosquito-buzz.mp3';
const AUDIO_KILL_PATH = 'audio/mosquito-kill.mp3';
```

You can change these paths if your files have different names or are in a different location.

