import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { types } from "util";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const prompt = fs.readFileSync("prompt.txt", "utf-8");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get("/generate_output", async (req, res) => {
  try {
    const inputText = req.query.input_text;
    if (!inputText) {
      return res.status(400).send("Input text is required");
    }
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          type: "text",
          text: inputText,
        },
      ],
      config: {
        systemInstruction: prompt,
      },
    });
    const formattedArray = response.text.split("end");
    res.json({ content: formattedArray });
  } catch (error) {
    console.error("Error generating output:", error);
    res.status(500).send("Error generating output");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
