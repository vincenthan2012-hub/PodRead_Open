
import { GoogleGenAI } from "@google/genai";
import { DEFAULT_PROMPT } from "../constants";
import { AppSettings } from "../types";

export async function transformTranscript(transcript: string, settings: AppSettings): Promise<string> {
  const fullPrompt = `${DEFAULT_PROMPT}\n\nInput Transcript:\n${transcript}`;

  // Use Gemini SDK if gemini is selected
  if (settings.aiProvider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    try {
      const response = await ai.models.generateContent({
        model: settings.modelName || 'gemini-3-pro-preview',
        contents: [{ text: fullPrompt }],
        config: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });

      if (!response.text) {
        throw new Error("No response generated from Gemini.");
      }
      return response.text;
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error;
    }
  }

  // Use OpenAI-compatible fetch for other providers
  const url = `${settings.apiUrl}/chat/completions`;
  const apiKey = settings.aiProvider === 'ollama' ? 'ollama' : settings.apiKey;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: settings.modelName,
        messages: [
          { role: 'user', content: fullPrompt }
        ],
        temperature: 0.7,
          maxOutputTokens: 8192,
          thinkingConfig: { thinkingBudget: 4000 }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(`${settings.aiProvider} Generation Error:`, error);
    throw error;
  }
}
