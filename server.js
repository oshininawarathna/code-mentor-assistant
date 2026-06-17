import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { reviewCode } from "./mentor.js";
import { saveReview, getReviews } from "./firebase.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Review code and save to Firebase
app.post("/api/review", async (req, res) => {
  const { code, language, history } = req.body;
  try {
    const reply = await reviewCode(code, language, history || []);
    await saveReview(code, language, reply);
    res.json({ reply });
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all past reviews
app.get("/api/history", async (req, res) => {
  try {
    const reviews = await getReviews();
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("✅ Code Mentor Agent running!");
  console.log("👉 Open your browser at: http://localhost:3000");
});