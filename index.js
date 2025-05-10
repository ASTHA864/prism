import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import { types } from "util";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

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
    const formattedArray = response.text.split("[End]");
    res.json({ content: formattedArray });
  } catch (error) {
    console.error("Error generating output:", error);
    res.status(500).send("Error generating output");
  }
});

app.get("/synthesize_audio", async (req, res) => {
  const content = req.query.content;
  if (!content) {
    return res.send(400).send("Missing query parameter content");
  }
  try {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.SPEECH_API,
      process.env.REGION
    );
    speechConfig.speechSynthesisVoiceName = "en-US-EmmaMultilingualNeural";
    // Set the output format to MP3.
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    synthesizer.speakTextAsync(
      content,
      (result) => {
        synthesizer.close(); // Close the synthesizer when done
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log("Speech synthesis completed.");
          const audioData = result.audioData; // audioData is an ArrayBuffer
          const audioBuffer = Buffer.from(audioData);

          res.setHeader("Content-Type", "audio/mpeg");
          res.send(audioBuffer);
        } else {
          console.error("Speech synthesis failed: " + result.errorDetails);
          res
            .status(500)
            .send("Speech synthesis failed: " + result.errorDetails);
        }
      },
      (error) => {
        synthesizer.close(); // Close the synthesizer on error
        console.error("Error during speech synthesis: ", error);
        res.status(500).send("Speech synthesis error: " + error);
      }
    );
  } catch (error) {
    console.error("Error in /text-to-speech route:", error);
    res
      .status(500)
      .send("Internal server error during text-to-speech processing.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
