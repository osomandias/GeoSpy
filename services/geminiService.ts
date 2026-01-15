
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, GroundingChunk } from "../types";

export const analyzeImageLocation = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Analiza esta imagen y actúa como un experto en geografía y turismo.
    1. Identifica el lugar exacto (monumento, ciudad, parque natural, etc.).
    2. Proporciona una breve descripción del lugar y su importancia.
    3. Dame 3 datos curiosos o históricos sobre este sitio.
    4. Proporciona el nombre del país al que pertenece.

    Responde exclusivamente en formato JSON con la siguiente estructura:
    {
      "locationName": "Nombre del lugar",
      "description": "Descripción corta",
      "country": "País",
      "facts": ["dato 1", "dato 2", "dato 3"]
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] || base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);

    // Extraer enlaces de búsqueda de Google (grounding)
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
    const links = chunks?.filter(c => c.web?.uri).map(c => c.web!.uri) || [];

    return {
      ...data,
      googleMapsLinks: links
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("No se pudo analizar la imagen. Inténtalo de nuevo.");
  }
};
