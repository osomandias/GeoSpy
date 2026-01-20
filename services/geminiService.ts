
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, GroundingChunk } from "../types";

/**
 * Extracts the MIME type and the raw base64 data from a data URL.
 */
const parseBase64 = (base64String: string) => {
  const match = base64String.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) {
    return { mimeType: 'image/jpeg', data: base64String };
  }
  return { mimeType: match[1], data: match[2] };
};

/**
 * Robustly extracts JSON from a string that might contain Markdown code blocks.
 */
const extractJson = (text: string) => {
  try {
    // Try to find content between ```json and ```
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    const cleanText = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(cleanText.trim());
  } catch (e) {
    console.error("Failed to parse JSON from response:", text);
    throw new Error("La respuesta del modelo no tiene un formato válido.");
  }
};

export const analyzeImageLocation = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const { mimeType, data } = parseBase64(base64Image);
  
  const prompt = `
    Analiza esta imagen y actúa como un experto en geografía y turismo.
    1. Identifica el lugar exacto (monumento, ciudad, parque natural, etc.).
    2. Proporciona una breve descripción del lugar y su importancia.
    3. Dame 3 datos curiosos o históricos sobre este sitio.
    4. Proporciona el nombre del país al que pertenece.

    Responde ESTRICTAMENTE con un objeto JSON válido. No añadas texto explicativo fuera del JSON.
    Estructura requerida:
    {
      "locationName": "Nombre del lugar",
      "description": "Descripción corta",
      "country": "País",
      "facts": ["dato 1", "dato 2", "dato 3"]
    }
  `;

  try {
    // No usamos responseMimeType: "application/json" aquí porque suele entrar en conflicto 
    // con el tool de googleSearch en los modelos preview, causando errores 500.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType, data } },
          { text: prompt }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    if (!response.text) {
      throw new Error("El modelo devolvió una respuesta vacía.");
    }

    const dataResult = extractJson(response.text);

    // Extraer enlaces de búsqueda de Google (grounding)
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
    const links = chunks
      ?.filter(c => c.web?.uri)
      .map(c => c.web!.uri) || [];

    return {
      locationName: dataResult.locationName || "Lugar desconocido",
      description: dataResult.description || "Sin descripción disponible.",
      country: dataResult.country || "Desconocido",
      facts: Array.isArray(dataResult.facts) ? dataResult.facts : [],
      googleMapsLinks: links
    };
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    // Manejo de errores específicos del backend
    if (error.status === 500 || (error.error && error.error.code === 500)) {
      throw new Error("Error interno del servidor de IA. Inténtalo de nuevo en unos segundos.");
    }
    throw new Error(error.message || "No se pudo analizar la imagen.");
  }
};
