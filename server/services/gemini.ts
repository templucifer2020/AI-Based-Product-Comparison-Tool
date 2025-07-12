import { GoogleGenAI } from "@google/genai";
import { ProductAnalysis, productAnalysisSchema } from "@shared/schema";
import dotenv from "dotenv";

dotenv.config();
// Get API key with better error handling
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY not found in environment variables!");
  console.error("Please make sure you have:");
  console.error("1. Created a .env file in the project root");
  console.error("2. Added your API key: GEMINI_API_KEY=your_actual_api_key_here");
  console.error("3. Get your free API key from: https://ai.google.dev/");
}

const ai = new GoogleGenAI({ 
  apiKey: apiKey || ""
});

export async function analyzeProductImage(imageBuffer: Buffer, mimeType: string): Promise<ProductAnalysis> {
  // Check if API key is available before making the request
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please check your .env file and ensure GEMINI_API_KEY is set with your API key from https://ai.google.dev/");
  }

  try {
    const currentDate = new Date().toLocaleDateString();
    
    const systemPrompt = `You are an expert consumer product analyst with access to scientific and market knowledge.

A user has provided an image of a product package. Extract any text from the image and analyze it.

Based on the text and visual information, do the following:

1. Identify the product name, type, and brand.
2. List all ingredients and describe:
   - What each ingredient is
   - Its benefits
   - Known side effects or health risks
   - Safety rating (safe, caution, warning)
3. Extract:
   - Usage instructions
   - Health warnings
   - Expiry date (if any)
4. Estimate how much time is left to use it (assume today is ${currentDate})
5. Determine who should or shouldn't use this product
6. Simulate a realistic review summary

Return everything in the exact JSON format specified in the schema.`;

    const contents = [
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: mimeType,
        },
      },
      systemPrompt,
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            productName: { type: "string" },
            category: { type: "string" },
            brand: { type: "string" },
            keyIngredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  function: { type: "string" },
                  benefits: { type: "string" },
                  sideEffects: { type: "string" },
                  safetyRating: { type: "string", enum: ["safe", "caution", "warning"] }
                },
                required: ["name", "function", "benefits", "sideEffects", "safetyRating"]
              }
            },
            usageInstructions: { type: "string" },
            warnings: { type: "string" },
            expiryDate: { type: "string" },
            timeLeft: { type: "string" },
            recommendedFor: { type: "string" },
            notRecommendedFor: { type: "string" },
            userSentiment: {
              type: "object",
              properties: {
                pros: { type: "array", items: { type: "string" } },
                cons: { type: "array", items: { type: "string" } },
                reviewSummary: { type: "string" }
              },
              required: ["pros", "cons", "reviewSummary"]
            }
          },
          required: ["productName", "category", "brand", "keyIngredients", "usageInstructions", "warnings", "recommendedFor", "notRecommendedFor", "userSentiment"]
        }
      },
      contents: contents,
    });

    const rawJson = response.text;
    
    if (!rawJson) {
      throw new Error("Empty response from Gemini AI");
    }

    const parsedResult = JSON.parse(rawJson);
    return productAnalysisSchema.parse(parsedResult);
  } catch (error) {
    console.error("Error analyzing product image:", error);
    throw new Error(`Failed to analyze product image: ${error}`);
  }
}
