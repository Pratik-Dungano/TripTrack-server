import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "GEMINI_KEY_NOT_SET";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function analyzeChatTranscript(transcript: string) {
  const prompt = `You are an AI travel decision assistant.\n\nAnalyze the following group chat conversation and extract travel preferences.\n\nTasks:\n1. Identify all travel locations mentioned.\n2. Count how many users prefer each location.\n3. Analyze sentiment and reasoning associated with each location.\n4. Infer user intent such as:\n   - Budget friendliness\n   - Adventure vs relaxation\n   - Nature vs city\n   - Travel convenience\n5. Return output ONLY in valid JSON. Do NOT wrap in markdown code blocks.\n\nJSON format:\n{\n  \"locations\": [\n    {\n      \"name\": \"Goa\",\n      \"mentionCount\": 5,\n      \"sentimentScore\": 0.85,\n      \"reasons\": [\"beaches\", \"nightlife\", \"easy travel\"]\n    }\n  ],\n  \"overallInsights\": \"Most users prefer coastal destinations with nightlife and budget travel.\"\n}\n\nChat Conversation:\n${transcript}`;

  const response = await ai.models.generateContent({
    model: "models/gemini-2.5-flash", // You can choose "gemini-2.5-flash" or others if your key supports it
    contents: prompt,
  });

  let text = response.text || '';
  if (!text) {
    throw new Error("Empty response from Gemini API");
  }
  
  // Strip markdown code blocks if present (```json ... ```)
  text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  
  // Parse JSON
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse Gemini JSON response:", text);
    throw new Error("Invalid JSON response from AI model");
  }
}
