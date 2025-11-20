const { GoogleGenerativeAI } = require("@google/generative-ai");

const feedbackcontroller = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("🔑 API Key loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // ✅ Correct model name
   
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(message);

    const reply = result?.response?.text() || "⚠️ No response from Gemini";

    res.json({ reply });
  } catch (err) {
    console.error("❌ Gemini error:", err);
    res.status(500).json({ error: err.message || "Gemini API error" });
  }
};

module.exports = { feedbackcontroller };
