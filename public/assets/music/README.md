# Music Assets

This directory contains background music files for the XGarden extension.

## Required Files

The following music files are referenced in the application:

- `peaceful-forest.mp3` - Peaceful forest ambience
- `calm-piano.mp3` - Calm piano music
- `ambient-space.mp3` - Ambient space sounds
- `medieval-lute.mp3` - Medieval lute music
- `gentle-rain.mp3` - Gentle rain sounds

## Options

### Option 1: Add Your Own Music Files
Place your own MP3 files in this directory with the names above.

### Option 2: Use Online URLs
The code in `ChatInterface.tsx` can be modified to use online music URLs instead of local files. See the `getMusicUrl` function.

### Option 3: Use Free Music
You can download royalty-free music from:
- [Pixabay Music](https://pixabay.com/music/)
- [Free Music Archive](https://freemusicarchive.org/)
- [Incompetech](https://incompetech.com/music/royalty-free/)

## Note
Currently, the application will work without music files, but you'll see console errors. The background images and other features will still function normally.
