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
                temperature: 0.5,
                max_tokens: 4000,
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert content rewriter who transforms webpage content into engaging, well-formatted HTML while preserving ALL important information and following specific style instructions.

CRITICAL REQUIREMENTS:
1. Follow the EXACT tone style requested (concise/conversational/academic)
2. Follow the EXACT color scheme requested (preserve original OR use green/grey scheme)
3. PRESERVE ALL IMAGES: Convert every [IMAGE: ...] to <img src="..." alt="...">
4. PRESERVE ALL LINKS: Convert every [LINK: text -> url] to <a href="url">text</a>
5. PRESERVE ALL TABLES: Recreate with proper HTML <table> structure
6. Include ALL factual content from the source
7. Output ONLY clean HTML (NO code blocks, NO \`\`\`html tags, NO <style> tags, NO CSS)
8. Use semantic HTML: <h1>, <h2>, <h3>, <p>, <strong>, <em>, <ul>, <ol>, <li>, <a>, <img>, <table>, <blockquote>
9. Convert any **markdown bold** to <strong>HTML tags</strong>
10. Make content visually scannable with proper heading hierarchy

You will receive specific instructions about:
- Tone (concise/conversational/academic) - follow this precisely
- Color scheme (preserve original OR use green/grey) - follow this precisely
- Image and link preservation requirements

Your output must be clean, valid HTML that can be directly inserted into a webpage.`
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