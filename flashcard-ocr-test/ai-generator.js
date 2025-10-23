// ai-generator.js
import dotenv from 'dotenv' // Loads environment variables from .env
import OpenAI from 'openai'; // Use the OpenAI SDK


dotenv.config()

console.log("GROQ_API_KEY Loaded in ai-generator:", !!process.env.GROQ_API_KEY);
// Check if the API key is loaded
if (!process.env.GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY in .env file");
}

// Configure the OpenAI client to point to Groq's API
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1', // Groq's OpenAI-compatible endpoint
});

const generateFlashcards = async (text) => {
  const prompt = `Analyze the following text and generate a JSON array of flashcards. Each object must have a "front" and a "back". Output ONLY the raw JSON array and nothing else. Text: "${text}"`;

  console.log("Sending prompt to Groq..."); // Log before sending

  try {
    const response = await groq.chat.completions.create({
      // Use a fast and capable model available on Groq
      model: "llama-3.1-8b-instant",
      messages: [
        // System message (optional but good practice)
        { role: 'system', content: 'You are an assistant that creates flashcards as a JSON array.' },
        // User's request
        { role: 'user', content: prompt }
      ],
      // Force JSON output if the model supports it (Llama 3 does)
      response_format: { type: "json_object" },
      temperature: 0.1, // Lower temperature for more predictable JSON
      max_tokens: 512,
    });

    const jsonContent = response.choices[0].message.content;

    console.log("AI Raw Response Text:", jsonContent); // Log the raw JSON string

    // Parse the JSON string into a JavaScript object/array
    // Note: Groq with JSON mode usually returns an object containing the array. Adjust if needed.
    const parsedResponse = JSON.parse(jsonContent);

    // Assuming Groq returns {"flashcards": [...]}, extract the array.
    // If it returns the array directly, just use parsedResponse.
    const flashcardsArray = parsedResponse.flashcards || parsedResponse;

    if (!Array.isArray(flashcardsArray)) {
        throw new Error("AI did not return a valid flashcard array.")
    }

    console.log("Parsed flashcards successfully."); // Log success
    return flashcardsArray; // Return the array

  } catch (error) {
    console.error("Error generating flashcards with Groq:", error);
    throw new Error("Failed to generate flashcards from AI.");
  }
};

// Use ES Module export syntax
export { generateFlashcards };