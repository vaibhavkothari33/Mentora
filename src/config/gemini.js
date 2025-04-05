// src/config/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Missing Gemini API key. Please add VITE_GEMINI_API_KEY to your .env.local file');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateRoadmapWithGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const structuredPrompt = `
      Create a detailed learning roadmap for: "${prompt}"
      
      Return the response as a JSON object with the following structure:
      {
        "title": "string",
        "description": "string",
        "stages": [
          {
            "title": "string",
            "status": "required" | "recommended" | "optional",
            "steps": [
              {
                "title": "string",
                "description": "string",
                "duration": "string",
                "type": "concept" | "practice" | "video" | "project",
                "topics": ["string"],
                "resources": [
                  {
                    "name": "string",
                    "url": "string",
                    "type": "concept" | "practice" | "video" | "project"
                  }
                ]
              }
            ]
          }
        ]
      }

      Ensure each stage has at least one step, and each step has all required fields.
      Do not include any markdown formatting or backticks in the response.
      The response should be valid JSON that can be parsed directly.
    `;

    const result = await model.generateContent(structuredPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to ensure it's valid JSON
    const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
    
    try {
      const parsedRoadmap = JSON.parse(cleanedText);
      
      // Validate the structure
      if (!parsedRoadmap.title || !parsedRoadmap.stages || !Array.isArray(parsedRoadmap.stages)) {
        throw new Error('Invalid roadmap structure');
      }
      
      // Ensure each stage has the required fields
      parsedRoadmap.stages.forEach((stage, index) => {
        if (!stage.title || !stage.status || !Array.isArray(stage.steps)) {
          throw new Error(`Invalid stage structure at index ${index}`);
        }
        
        // Ensure each step has the required fields
        stage.steps.forEach((step, stepIndex) => {
          if (!step.title || !step.description || !step.duration || !step.type || !Array.isArray(step.topics)) {
            throw new Error(`Invalid step structure at stage ${index}, step ${stepIndex}`);
          }
        });
      });
      
      return parsedRoadmap;
    } catch (parseError) {
      console.error('Failed to parse roadmap:', parseError);
      throw new Error('Failed to generate valid roadmap format. Please try again.');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(error.message || 'Failed to generate roadmap');
  }
}