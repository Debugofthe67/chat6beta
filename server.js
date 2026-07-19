const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Global Cross-Origin safety rules allowing your legacy webkit client to handshake securely
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const OPENROUTER_API_KEY = process.env.GEMINI_API_KEY; 
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

app.get('/ping', function(req, res) {
    res.status(200).send('Server is awake');
});

app.post('/chat', async function(req, res) {
    try {
        if (!OPENROUTER_API_KEY) {
            return res.status(500).json({ reply: "Error: GEMINI_API_KEY environment variable is missing on Render." });
        }

        // Integrates your new official documentation tracking headers natively
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://chat6beta.onrender.com', 
                'X-OpenRouter-Title': 'Gemini iOS6 Chat App'      
            },
            body: JSON.stringify({
                // FIX 1: Added ":free" to match OpenRouter's free sandbox model routing
                model: 'google/gemini-2.5-flash:free', 
                // FIX 2: Caps response length to fit comfortably under your account limits
                max_tokens: 1000, 
                messages: [
                    {
                        role: 'user',
                        content: req.body.message
                    }
                ]
            })
        });


        const data = await response.json();
        
        // Safely extracts the text string out of OpenRouter's choice array index blocks
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            const replyText = data.choices[0].message.content;
            res.json({ reply: replyText });
        } else {
            console.error("Payload mismatch from OpenRouter:", JSON.stringify(data));
            res.json({ reply: "The processing tunnel encountered an error. Please tap Send again." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Internal Server Error parsing communication lanes across OpenRouter." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', function() {
    console.log('OpenRouter server engine active on port ' + PORT);
});
