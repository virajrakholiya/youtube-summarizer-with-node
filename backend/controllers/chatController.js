const YoutubeTranscriptApi = require('youtube-transcript-api');
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { SystemMessage, HumanMessage, AIMessage } = require("@langchain/core/messages");
const { customInstructions } = require("../data/data");

exports.summarize = async (req, res) => {
  try {
    const { url, messages } = req.body;

    const videoId = new URL(url).searchParams.get("v");
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    let transcript;
    try {
      transcript = await YoutubeTranscriptApi.getTranscript(videoId);
    } catch (transcriptError) {
      console.error("Transcript fetch error:", transcriptError);
      return res.status(404).json({ 
        error: "Could not fetch video transcript", 
        details: transcriptError.message 
      });
    }

    const fullText = transcript.map(item => item.text).join(" ");

    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-pro",
      apiKey: process.env.GOOGLE_API_KEY,
    });

    // Prepare messages for the model
    const processedMessages = [
      new SystemMessage(customInstructions),
      ...(messages || []).map((m) =>
        m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
      ),
      new HumanMessage(`Summarize this YouTube video transcript in English, regardless of the original language: ${fullText}`),
    ];

    // Generate summary
    const response = await model.invoke(processedMessages);

    // Send the summary back to the client
    res.json({ summary: response.content });
  } catch (error) {
    console.error("Error in YouTube video summarizer:", error);
    
    if (error.message.includes("InvalidURLError")) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    res.status(500).json({ 
      error: "Failed to summarize video", 
      details: error.message 
    });
  }
};