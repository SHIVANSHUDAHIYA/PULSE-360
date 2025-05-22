import express from 'express';
import axios from 'axios';

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

router.post('/chat', async (req, res) => {
  try {
    const { userMessage } = req.body;
    const systemPrompt = `You are a helpful medical assistant. When a user describes a health concern, do the following:
1. First, provide a short, clear paragraph (2-3 sentences) directly answering the user's question.
2. Then, provide a JSON array of 5 objects, each with a 'title' and 'description', for the following categories: Disease, Precaution, Medication, Workout, Diet. Each description should be concise and relevant to the user's concern. Example:
[
  {"title": "Disease", "description": "Possible disease and a short explanation."},
  {"title": "Precaution", "description": "Precaution and a short explanation."},
  {"title": "Medication", "description": "Medication and a short explanation (do not recommend prescription drugs, only general OTC or advice to consult a professional)."},
  {"title": "Workout", "description": "Workout advice and a short explanation."},
  {"title": "Diet", "description": "Diet advice and a short explanation."}
]
Do not mention that you are an AI or suggest consulting a real doctor. If you are unsure, provide general health or wellness suggestions instead. Only output the paragraph, then the JSON array on a new line.`;
    const payload = {
      contents: [{
        parts: [{ text: `${systemPrompt}\nUser: ${userMessage}` }]
      }]
    };

    const response = await axios.post(GEMINI_API_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Extract the response text
    let rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
    // Remove code block markers if present
    rawText = rawText.replace(/```json|```/gi, '').trim();
    // Split the response into paragraph and JSON array
    let paragraph = rawText;
    let cards = [];
    const jsonStart = rawText.indexOf('[');
    if (jsonStart !== -1) {
      paragraph = rawText.slice(0, jsonStart).trim();
      const jsonString = rawText.slice(jsonStart);
      try {
        cards = JSON.parse(jsonString);
      } catch (e) {
        cards = [];
      }
    }
    res.json({ response: paragraph, cards });
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get response from Gemini AI' });
  }
});

export default router; 