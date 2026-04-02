import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import gTTS from "google-tts-api";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// ===============================
// 🔥 split text unlimited
// ===============================
function splitText(text, max = 200) {
  const chunks = [];
  let current = "";

  const words = text.split(" ");

  for (let w of words) {
    if ((current + " " + w).length > max) {
      chunks.push(current);
      current = w;
    } else {
      current += (current ? " " : "") + w;
    }
  }

  if (current) chunks.push(current);

  return chunks;
}

// ===============================
// 🚀 ROOT CHECK
// ===============================
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "TTS API FULL RUNNING"
  });
});

// ===============================
// 🔥 MAIN TTS API (UNLIMITED)
// ===============================
app.post("/tts", async (req, res) => {
  try {
    const { text, lang = "vi" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "missing text" });
    }

    const chunks = splitText(text, 200);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-cache");

    for (const chunk of chunks) {
      const url = gTTS.getAudioUrl(chunk, {
        lang,
        slow: false,
        host: "https://translate.google.com",
      });

      const audio = await fetch(url);

      if (!audio.ok) continue;

      await new Promise((resolve, reject) => {
        audio.body.pipe(res, { end: false });
        audio.body.on("end", resolve);
        audio.body.on("error", reject);
      });
    }

    res.end();

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error" });
  }
});

// ===============================
// 🚀 START SERVER
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 FULL TTS API running on port " + PORT);
});
