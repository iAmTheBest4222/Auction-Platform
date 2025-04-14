const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const OpenAI = require("openai");
const fallbackResponses = require("../services/fallbackResponses");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", auth, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    try {
      const messages = [
        {
          role: "system",
          content:
            "You are a helpful auction platform assistant. You can help users with bidding strategies, item valuations, and general auction advice. Be concise and professional.",
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: message },
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      res.json({
        success: true,
        reply: completion.choices[0].message.content,
        messageId: completion.id,
        isAI: true,
      });
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError);

      // Use fallback system for quota errors or any OpenAI API issues
      const fallbackResponse = fallbackResponses.findBestMatch(message);

      res.json({
        success: true,
        reply: fallbackResponse,
        messageId: "fallback-" + Date.now(),
        isAI: false,
        usingFallback: true,
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing chat request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
