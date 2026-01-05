import { GoogleGenAI } from "@google/genai";
import { Coordinates, SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchPlacesWithGemini = async (
  query: string,
  userLocation: Coordinates | null
): Promise<SearchResult> => {
  try {
    const modelId = "gemini-2.5-flash"; // Required for Google Maps Grounding

    // Configure tool config based on location availability
    let toolConfig = undefined;
    if (userLocation) {
      toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
        },
      };
    }

    // Explicitly command the model to be exhaustive to overcome the default behavior of returning ~20 items.
    const enhancedQuery = `Perform an exhaustive search for places related to: "${query}". 
    Do not limit the results to the top 20. I need a comprehensive list (aim for 50-100 places if available). 
    List every single relevant place found with its details. Respond in Thai language.`;

    let response;
    let attempts = 0;
    const maxAttempts = 3;

    // Retry logic for 500 Internal Errors
    while (attempts < maxAttempts) {
      try {
        response = await ai.models.generateContent({
          model: modelId,
          contents: enhancedQuery,
          config: {
            tools: [{ googleMaps: {} }],
            // Only include toolConfig if it exists to avoid sending empty/undefined structures
            ...(toolConfig ? { toolConfig } : {}),
          },
        });
        break; // Success, exit loop
      } catch (e: any) {
        attempts++;
        // Check for 500 Internal Error or similar generic server issues
        const isInternalError = 
          e.message?.includes('Internal error') || 
          e.status === 500 || 
          (e.error && e.error.code === 500);

        if (isInternalError && attempts < maxAttempts) {
          console.warn(`Gemini API 500 Error (Attempt ${attempts}/${maxAttempts}). Retrying...`);
          // Exponential backoff: 1000ms, 2000ms...
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          continue;
        }
        
        // If not a retryable error or max attempts reached, throw
        throw e;
      }
    }

    if (!response) {
      throw new Error("Failed to retrieve a response from Gemini API.");
    }

    const text = response.text || "ไม่พบข้อมูลรายละเอียด";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      text,
      chunks,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};