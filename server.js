const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Force-allow open cross-origin traffic explicitly for older clients
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
            return res.status(500).json({ reply: "Error: GEMINI_API_KEY variable is missing on Render." });
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + OPENROUTER_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash', 
                messages: [
                    {
                        role: 'user',
                        content: req.body.message
                    }
                ]
            })
        });

        const data = await response.json();
        
        // FIX: Added [0] brackets to correctly extract text from OpenRouter's array format
        if (data.choices && data.choices[0] && data.choices[0].message) {
            res.json({ reply: data.choices[0].message.content });
        } else {
            console.error("Payload mismatch from OpenRouter:", JSON.stringify(data));
            res.json({ reply: "OpenRouter response formatting error. Please try again." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ reply: "Internal Server Error parsing communication lanes." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', function() {
    console.log('OpenRouter server engine active on port ' + PORT);
});
