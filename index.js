import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// TTS FREE (Google Translate unofficial)
// ======================
app.post("/tts", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).send("missing text");

        // Google Translate TTS free endpoint
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;

        const audio = await axios({
            method: "GET",
            url,
            responseType: "arraybuffer",
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        res.set({
            "Content-Type": "audio/mpeg"
        });

        res.send(audio.data);

    } catch (e) {
        console.log(e);
        res.status(500).send("error");
    }
});

// ======================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log("🔥 VOICE FREE RUNNING ON", PORT);
});
