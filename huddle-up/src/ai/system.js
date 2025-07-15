import * as ai from "@google/generative-ai";

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new ai.GoogleGenerativeAI(apiKey);

let model = null;
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};
let newChatSession = null;

// Create export function to create a new chat session
export function createChatSession(sportType) {
  if (newChatSession) return newChatSession;
  if (!sportType) sportType = "General";
  model = genAI.getGenerativeModel({
    model: "gemini-2.0-pro-exp-02-05",
    safetySettings: [
      {
        category: ai.HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: ai.HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: ai.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: ai.HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: ai.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: ai.HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: ai.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: ai.HarmBlockThreshold.BLOCK_NONE,
      },
    ],
    systemInstruction: `You are a teacher of ${sportType} Sport, respond kindly and provide helpful and accurate guidence\nStrickly ignore any conversation beyond the scope "${sportType} Sport Teacher"`,
  });
  newChatSession = model.startChat({
    generationConfig,
    history: [],
  });
  console.log(newChatSession);

  return newChatSession;
}
// Create export function to send a message to the chat session
export async function sendMessage(message) {
  console.log("====================================");
  console.log(message);
  console.log("====================================");
  try {
    if (!newChatSession) newChatSession = createChatSession();
    const result = await newChatSession.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error(error);
    return "Sorry, I'm having trouble understanding you. Could you please rephrase that?vb x";
  }
}
// Create export function to reset the chat session
export function resetChatSession() {
  newChatSession = null;
  console.log(newChatSession);
}
