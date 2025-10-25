const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI API configuration
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

// Store your OpenAI API key in environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set');
    process.exit(1);
}

// Endpoint to handle summarization
app.post('/api/summarize', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await fetch(OPENAI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                temperature: 0.3,
                max_tokens: 2000,
                messages: [
                    {
                        role: 'system',
                        content: 'You rewrite and summarize webpage text accurately, preserving facts. Keep formatting clean and minimal. Be concise but comprehensive.'
                    },
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${errorText}`);
        }

        const data = await response.json();
        const output = data.choices?.[0]?.message?.content || '';

        res.json({ ok: true, output });
    } catch (error) {
        console.error('Summarize error:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Endpoint to handle engagification
app.post('/api/engagify', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const response = await fetch(OPENAI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                temperature: 0.3,
                max_tokens: 3000,
                messages: [
                    {
                        role: 'system',
                        content: 'You rewrite webpage content in an engaging way while preserving ALL important information. Focus on the MAIN CONTENT and key information, not on author details or metadata. Remove only unnecessary fluff, keep all key facts and details. Use rich HTML formatting: large headings (h1, h2, h3), bold text using <strong> tags (NOT **markdown**), colors, different font sizes, and visual elements. Make it highly readable with proper typography. Use diverse colors like #8b5cf6 (purple) for headings, #f59e0b (orange) for important points, #10b981 (green) for highlights, #ef4444 (red) for emphasis, #3b82f6 (blue) for links. Use font sizes like 1.5rem, 1.25rem for emphasis. IMPORTANT: Do NOT include any CSS code, style tags, or HTML code blocks in your response. Only output clean HTML content. Preserve any hyperlinks and images from the original content. Convert any **bold** markdown to proper <strong>HTML tags. Include ALL images from the original content.'
                    },
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${errorText}`);
        }

        const data = await response.json();
        const output = data.choices?.[0]?.message?.content || '';

        res.json({ ok: true, output });
    } catch (error) {
        console.error('Engagify error:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Engagify backend is running',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Engagify backend server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});
