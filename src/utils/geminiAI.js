// src/utils/geminiAI.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateAssignment(topic, difficulty) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Validate topic
    const validationPrompt = `Determine if the following topic is related to technical programming or development.
    Topic: "${topic}"
    Respond with a JSON object containing:
    - "isTechnical": boolean
    - "isAppropriate": boolean
    - "reason": string explaining why if either check fails`;

    const validationResult = await model.generateContent(validationPrompt);
    const validationResponse = JSON.parse(validationResult.response.text());

    if (!validationResponse.isAppropriate || !validationResponse.isTechnical) {
      throw new Error(validationResponse.reason || "Please provide a valid technical programming topic");
    }

    const prompt = `Create a blockchain/web3 programming assignment with the following criteria:
    Topic: ${topic}
    Difficulty: ${difficulty}
    
    Please provide the response in the following JSON format:
    {
      "title": "Assignment title",
      "description": "Detailed description of the task",
      "requirements": ["requirement1", "requirement2", ...],
      "hints": ["hint1", "hint2", ...],
      "estimatedTime": "estimated completion time"
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse the response
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    if (error.message.includes("Please provide a valid technical")) {
      // Pass through our custom error messages
      throw error;
    }
    console.error('Error generating assignment:', error);
    throw new Error('Failed to generate assignment. Please ensure your topic is related to programming or development.');
  }
}

export async function checkAssignment(assignment, solution) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are a blockchain education expert. Please evaluate this solution for the following assignment:

    Assignment:
    ${assignment.title}
    ${assignment.description}
    
    Requirements:
    ${assignment.requirements.join('\n')}
    
    Student's Solution:
    ${solution}
    
    Please provide your evaluation in the following JSON format:
    {
      "score": <number between 0-10>,
      "analysis": "detailed analysis of the solution",
      "suggestions": ["improvement1", "improvement2", ...],
      "strengthPoints": ["strength1", "strength2", ...],
      "weaknessPoints": ["weakness1", "weakness2", ...]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse the response
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error checking assignment:', error);
    throw new Error('Failed to check solution');
  }
}

export async function generateProblemBreakdown(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // First, validate if the prompt is technical and appropriate
    const validationPrompt = `Determine if the following query is related to technical programming, development, or learning. 
    Respond with a JSON object containing:
    - "isTechnical": boolean (true if related to programming/development)
    - "isAppropriate": boolean (false if contains inappropriate/NSFW content)
    - "reason": string explaining why if either check fails
    
    Query: "${prompt}"`;

    const validationResult = await model.generateContent(validationPrompt);
    const validationResponse = JSON.parse(validationResult.response.text());

    if (!validationResponse.isAppropriate) {
      throw new Error("Inappropriate content detected. Please keep queries professional and work-appropriate.");
    }

    if (!validationResponse.isTechnical) {
      throw new Error("Please provide a technical programming or development related query. For example: 'How to build a React component' or 'Implementing smart contracts'");
    }

    // If validation passes, proceed with the breakdown
    const systemPrompt = `Break down this technical project requirement into clear, manageable steps. 
    Only provide response if it's related to programming, development, or technical learning.
    Format the response as JSON with the following structure:
    {
      "steps": [
        {
          "title": "Step title",
          "description": "Detailed description of what needs to be done",
          "estimatedTime": "Estimated time to complete this step",
          "requirements": ["requirement1", "requirement2"],
          "resources": ["helpful resource1", "helpful resource2"]
        }
      ]
    }`;

    const result = await model.generateContent(`${systemPrompt}\n\nProject: ${prompt}`);
    const response = await result.response;
    const text = response.text();
    
    // Additional safety check for the response
    if (text.toLowerCase().includes("nsfw") || 
        text.toLowerCase().includes("inappropriate") ||
        text.toLowerCase().includes("adult content")) {
      throw new Error("Invalid or inappropriate request. Please keep queries technical and professional.");
    }
    
    return JSON.parse(text);
  } catch (error) {
    if (error.message.includes("Invalid or inappropriate") || 
        error.message.includes("Please provide a technical")) {
      // Pass through our custom error messages
      throw error;
    }
    console.error('Error generating problem breakdown:', error);
    throw new Error('Failed to generate problem breakdown. Please ensure your query is related to technical topics.');
  }
}