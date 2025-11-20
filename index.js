// Gerekli paketler
const express = require("express");
const app = express();
require("dotenv").config();

app.use(express.json());

// Ana endpoint (çalışıyor mu test için)
app.get("/", (req, res) => {
    res.send("Instagram Growth Tool Aktif ✔️");
});

// Key doğrulama sistemi
app.get("/api", (req, res) => {
    const key = req.query.key;
    const id = req.query.id;

    if (key !== process.env.API_KEY || id !== process.env.API_ID) {
        return res.status(403).json({ error: "Geçersiz key veya ID" });
    }

    res.json({
        status: "Başarılı",
        message: "Doğrulama geçti!"
    });
});

// Instagram endpoint örneği (geliştirilecek)
app.post("/send-like", (req, res) => {
    const key = req.query.key;
    const id = req.query.id;

    if (key !== process.env.API_KEY || id !== process.env.API_ID) {
        return res.status(403).json({ error: "Geçersiz key veya ID" });
    }

    const { username, amount } = req.body;

    res.json({
        status: "işlem alındı",
        user: username,
        adet: amount,
    });
});

// Render için port ayarı
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu çalışıyor → ${PORT}`));
