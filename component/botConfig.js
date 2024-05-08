//Configuracion del Bot: generationConfig, safetySettings
import {HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export const generationConfig = {
  temperature: 0.4, // Precisión vs Creatividad en las repuestas de la AI, (1 = max creatividad) (0 = max presición)
  topK: 1,
  topP: 1,
  maxOutputTokens: 500, //Cantidad de tokens por repuesta
};

export const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];