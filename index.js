import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function splitText(text, max = 180) {
    if (!text || typeof text !== "string") return [];

    const words = text.replace(/\s+/g, " ").split(" ");
    const chunks = [];
    let current = "";

    for (let w of words) {
        const test = current + " " + w;

        if (Buffer.byteLength(test, "utf8") > max) {
            if (current) chunks.push(current);
            current = w;
        } else {
            current = test;
        }
    }

    if (current) chunks.push(current);

    return chunks;
}

async function getAudio(text) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;

    for (let i = 0; i < 2; i++) {
        try {
            const res = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 15000,
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Referer": "https://translate.google.com/"
                }
            });

            if (res.data && res.data.byteLength > 1000) {
                return res.data;
            }
        } catch {}
    }

    return null;
}

app.get("/", (req, res) => {
    res.send("VOICE API RUNNING");
});

app.post("/tts", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) return res.status(400).send("missing text");

        const chunks = splitText(text, 180);

        res.setHeader("Content-Type", "audio/mpeg");

        for (const chunk of chunks) {
            const audio = await getAudio(chunk);
            if (audio) res.write(Buffer.from(audio));
        }

        res.end();

    } catch (e) {
        console.log(e.message);
        res.status(500).send("error");
    }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log("🔥 VOICE API RUNNING", PORT);
});
