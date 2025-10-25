# Engagify Backend Server

This is the backend server for the Engagify browser extension that handles OpenAI API calls securely.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with your OpenAI API key:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

3. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

- `POST /api/summarize` - Summarize webpage content
- `POST /api/engagify` - Engagify webpage content
- `GET /api/health` - Health check

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `PORT` - Server port (default: 3000)
