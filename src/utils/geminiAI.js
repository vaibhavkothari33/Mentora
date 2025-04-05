// src/utils/geminiAI.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateAssignment(topic, difficulty) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    console.error('Error generating assignment:', error);
    throw new Error('Failed to generate assignment');
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

    const systemPrompt = `Break down this project requirement into clear, manageable steps. Format the response as JSON with the following structure:
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
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating problem breakdown:', error);
    throw new Error('Failed to generate problem breakdown');
  }
}