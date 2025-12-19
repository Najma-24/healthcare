
import { GoogleGenAI, Type } from "@google/genai";
import { Sentiment, Category, ReviewAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeMedicalReview = async (text: string): Promise<Partial<ReviewAnalysis>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following patient review for a hospital/clinic: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.STRING,
              description: "Must be one of: Positive, Negative, Neutral"
            },
            sentimentScore: {
              type: Type.NUMBER,
              description: "A score from 0.0 to 1.0 representing the intensity (1 is strongly positive/negative, 0 is truly neutral)"
            },
            category: {
              type: Type.STRING,
              description: "The primary subject. One of: Wait Time, Staff Behavior, Facility Quality, Medical Outcome, Billing, Other"
            },
            summary: {
              type: Type.STRING,
              description: "A concise 1-sentence summary of the core issue or praise"
            },
            improvementSuggestion: {
              type: Type.STRING,
              description: "Actionable advice for the hospital management based on this review"
            }
          },
          required: ["sentiment", "sentimentScore", "category", "summary", "improvementSuggestion"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      sentiment: result.sentiment as Sentiment,
      sentimentScore: result.sentimentScore,
      category: result.category as Category,
      summary: result.summary,
      improvementSuggestion: result.improvementSuggestion
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
