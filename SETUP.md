# Engagify Browser Extension

A powerful browser extension that transforms web pages into engaging, visually appealing content with AI-powered rewriting and summarization.

## ✨ Features

- **Engagify Content**: Transform any webpage into engaging, well-formatted content
- **Smart Summarization**: Get concise summaries of web pages
- **Visual Enhancement**: Purple headings, orange bold text, green highlights
- **Image Preservation**: Includes all images, tables, charts, and graphs
- **Adaptive Theming**: Colors adapt to page theme (dark, bland, colorful)
- **Multiple Tones**: Concise, Conversational, Academic writing styles
- **Loading Screens**: Visual feedback during processing

## 🚀 Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Extension Setup
1. Open Chrome/Edge and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the extension folder
4. The extension will appear in your browser toolbar

## 📁 Project Structure

```
engagify_extension/
├── backend/                 # Backend server
│   ├── server.js           # Express server
│   ├── package.json     # Dependencies
│   └── README.md          # Backend setup
├── content.js              # Content script
├── background.js           # Background script
├── popup.html             # Extension popup
├── popup.js               # Popup functionality
├── options.html           # Settings page
├── options.js             # Settings logic
├── manifest.json          # Extension manifest
├── styles.css             # Styling
└── README.md              # This file
```

## 🔧 Configuration

### Tone Options
- **Concise**: Brief, direct, bullet points
- **Conversational**: Friendly, engaging tone
- **Academic**: Formal, precise language

### Character Limits
- Default: 20,000 characters
- Configurable in settings

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # For development with auto-restart
```

### Extension Development
1. Make changes to extension files
2. Reload the extension in `chrome://extensions/`
3. Test on any webpage

## 📝 Usage

1. **Engagify**: Click the extension icon and select "Engagify" to transform the current page
2. **Summarize**: Click "Summarize" to get a brief summary
3. **Settings**: Click "Customize" to adjust tone and character limits

## 🔒 Security

- API keys are stored securely on your backend server
- No client-side API key exposure
- All processing happens on your local backend

## 📄 License

MIT License - Feel free to use and modify as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🐛 Issues

If you encounter any issues:
1. Check that the backend server is running
2. Verify your OpenAI API key is correct
3. Ensure the extension has proper permissions
