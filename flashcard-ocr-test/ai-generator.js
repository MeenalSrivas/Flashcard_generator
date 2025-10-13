import dotenv from 'dotenv';
import { InferenceClient} from '@huggingface/inference';
dotenv.config()


const hf = new  InferenceClient(process.env.HF_ACCESS_TOKEN);

export const generateFlashcards = async (text) =>{
    const prompt = `[INST] You are a helpful assistant that creates flashcards from text and outputs them in JSON format. Analyze the following text and generate a JSON array of flashcards. Each object in the array should have a "front" (the key term or question) and a "back" (the definition or answer). Ensure the output is only the raw JSON array.

  Text: "${text}" [/INST]`



  try {
    const response = await hf.chatCompletion({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        messages: [
        // The first message sets the context for the AI
        { role: 'system', content: 'You are a helpful assistant that creates flashcards from text and outputs them in JSON format.' },
        // The second message is the user's actual request
        { role: 'user', content: prompt },
      ],
      
      })
      


    const generatedText = response.choices[0].message.content;
    console.log("AI Raw Response Text:", generatedText);
    
    const jsonMatch = generatedText.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      throw new Error("Failed to find valid JSON in the AI response.");
    }
    
    return JSON.parse(jsonMatch[0]);

  }catch(error){
    console.error('Error generating flashcards:', error);
  }
}
