import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyCq7d0KOpOwWrum2cnE7qiGfoDQUXn3YQw";
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    console.log("Attempting to list models...");
    const models = await genAI.listModels();
    console.log("Available models:");
    for (const model of models) {
      console.log(`- ${model.name}`);
      console.log(
        `  Supported methods: ${model.supportedGenerationMethods?.join(", ")}`,
      );
    }
  } catch (error) {
    console.error("Error listing models:", error.message);

    // Try a simple generation with different model names
    console.log("\nTrying different model names...");
    const modelNames = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-2.0-flash-exp",
    ];

    for (const modelName of modelNames) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello");
        console.log(`✓ ${modelName} works!`);
        console.log(`Response: ${result.response.text()}`);
        break;
      } catch (err) {
        console.log(`✗ ${modelName} failed: ${err.message}`);
      }
    }
  }
}

listModels();
