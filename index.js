import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/tts", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).send("missing text");

        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;

        const audio = await axios({
            method: "GET",
            url,
            responseType: "arraybuffer",
            headers: {
                "User-Agent": "Mozilla/5.0"
            },
            timeout: 15000
        });

        res.set({
            "Content-Type": "audio/mpeg",
            "Content-Disposition": "inline"
        });

        return res.send(audio.data);

    } catch (e) {
        console.log("TTS ERROR:", e.message);
        return res.status(500).send("error");
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log("🔥 VOICE API RUNNING ON", PORT);
});
