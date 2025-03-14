# Speech-to-Text and VR Tour Web Application

This web application features two main components:
1. A Speech-to-Text converter with translation capabilities
2. A VR Tour viewer

## Features

### Speech-to-Text Converter
- Converts spoken words to text in real-time using the Web Speech API
- Supports multiple languages for speech recognition
- Translates the recognized text to various languages
- Simple and intuitive user interface

### VR Tour Viewer
- Displays 360-degree panoramic images
- Supports navigation through VR environments
- Compatible with modern web browsers

## Setup Instructions

### Local Development

1. Extract all files from the zip archive
2. Open the project in Visual Studio Code or your preferred editor
3. Start a local web server to run the application
   - You can use Python's built-in server: `python -m http.server 5000`
   - Or use any other static file server of your choice
4. Access the application through your browser at `http://localhost:5000`

### File Structure

- `index.html` - Main landing page
- `main-styles.css` - Styles for the landing page
- `speech-to-text.html` - Speech recognition and translation page
- `speech-styles.css` - Styles for the speech recognition page
- `speech-script.js` - JavaScript functionality for speech recognition and translation
- `vr-tour.html` - VR tour viewer page
- `vr-styles.css` - Styles for the VR tour page
- `assets/` - Directory containing images and other media files

## Browser Compatibility

- The Speech-to-Text feature works best in Chrome, Edge, or Safari
- The application requires microphone access for speech recognition
- Translation features require an internet connection

## License

This is an open-source project. Feel free to modify and use it for any purpose.

## Acknowledgements

- Web Speech API for speech recognition functionality
- Google Translate API for translation services