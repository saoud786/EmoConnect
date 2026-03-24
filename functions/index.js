const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const { GoogleGenerativeAI } = require("@google/generative-ai");

setGlobalOptions({ maxInstances: 10 });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.emoAI = onRequest(async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(`
You are EmoAI, a calm and emotionally supportive assistant.
Respond gently and positively.
Do not give medical diagnosis.
User says: ${message}
    `);

    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "AI processing failed" });
  }
});