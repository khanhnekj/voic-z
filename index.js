import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import gTTS from "google-tts-api";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function splitText(text, max = 200) {
    const chunks = [];
    let current = "";
    const words = text.split(" ");

    for (let w of words) {
        const test = current + " " + w;

        if (Buffer.byteLength(test) > max) {
            chunks.push(current);
            current = w;
        } else {
            current += (current ? " " : "") + w;
        }
    }

    if (current) chunks.push(current);

    return chunks;
}

app.get("/", (req, res) => {
    res.json({ status: "ok", message: "TTS API running" });
});

app.post("/tts", async (req, res) => {
    try {
        const { text, lang = "vi" } = req.body;

        if (!text) {
            return res.status(400).send("missing text");
        }

        const chunks = splitText(text, 200);

        res.setHeader("Content-Type", "audio/mpeg");

        for (const chunk of chunks) {
            const url = gTTS.getAudioUrl(chunk, {
                lang,
                slow: false
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
        res.status(500).send("server error");
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("TTS API running on port " + PORT);
});
