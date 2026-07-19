const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURATION: Points directly to your secure OpenRouter dashboard variable
const OPENROUTER_API_KEY = process.env.GEMINI_API_KEY; 
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

app.get('/ping', function(req, res) {
    res.status(200).send('Server is awake');
});

app.post('/chat', async function(req, res) {
    try {
        if (!OPENROUTER_API_KEY) {
            return res.status(500).json({ reply: "Error: OPENROUTER_API_KEY environment variable is missing on Render." });
        }

        // 1. Matches your official documentation payload structure exactly
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash', // Direct target to Google's updated Flash model via OpenRouter
                messages: [
                    {
                        role: 'user',
                        content: req.body.message, // Pulls the text sent from your iOS 6 device
                    }
                ]
            })
        });

        const data = await response.json();
        
        // 2. Traverses OpenRouter's structural array formatting safely
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const reply = data.choices[0].message.content;
            res.json({ reply: reply });
        } else {
            console.error("Payload mismatch from OpenRouter:", JSON.stringify(data));
            res.json({ reply: "The routing tunnel is initializing. Please send your message again." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Internal Server Error parsing communication lanes across OpenRouter." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', function() {
    console.log('OpenRouter tunnel processing data on port ' + PORT);
});
