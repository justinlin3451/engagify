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
                max_tokens: 1200, // Reduced for speed
                messages: [
                    {
                        role: 'system',
                        content: 'Summarize webpage text accurately. Keep facts. Be concise.'
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
                temperature: 0.4,
                max_tokens: 2500, // Reduced from 3000 for speed
                messages: [
                    {
                        role: 'system',
                        content: 'Rewrite webpage content engagingly. Follow tone and color instructions exactly. Convert [IMAGE: desc | Context: context -> url] to <figure><img src="url" alt="desc"><figcaption>[caption based on context/desc]</figcaption></figure>. Convert [LINK: text -> url] to <a href="url">text</a>. Keep ALL facts. Output ONLY HTML with tags: <h1> <h2> <h3> <p> <strong> <em> <ul> <li> <a> <img> <figure> <figcaption>. NO code blocks, NO <style> tags.'
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

// Endpoint to handle chatbot
app.post('/api/chat', async (req, res) => {
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
                temperature: 0.5,
                max_tokens: 300, // Short responses for chat
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant answering questions about an article. Be concise, friendly, and accurate. If the answer is not in the article, say so politely.'
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
        console.error('Chat error:', error);
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