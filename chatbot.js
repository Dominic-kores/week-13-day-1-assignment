
require("dotenv").config();

const Anthropic = require("@anthropic-ai/sdk");
const readline = require("node:readline");

// Validate the API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in .env");
  process.exit(1);
}

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL =
  process.env.ANTHROPIC_MODEL ||
  "claude-haiku-5-5";

// Configure CLI input and output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define the chatbot's personality
const SYSTEM_PROMPT = `
You are Kenya Tech Assistant, a friendly and
knowledgeable AI assistant.

You help Kenyan developers, university students,
and entrepreneurs understand modern technology.

Your areas of expertise include:
- JavaScript, React, Node.js and APIs
- Web development and software engineering
- M-Pesa and Safaricom Daraja API integration
- Artificial intelligence and machine learning
- Kenyan startups and technology businesses
- Coding careers and technical interviews

Use practical examples relevant to Kenya.
Explain technical concepts clearly.
Be accurate, supportive and professional.
Remember the conversation context provided.
`;

// Maintain the full conversation in memory
const conversationHistory = [];

// ------------------------------------------------
// BONUS CHALLENGE: TOKEN AND COST TRACKING
// ------------------------------------------------

// Assignment-provided example pricing
// These are illustrative rates, not live pricing.
const INPUT_PRICE_PER_MILLION = 3.0;
const OUTPUT_PRICE_PER_MILLION = 15.0;

const USD_TO_KES =
  Number(process.env.USD_TO_KES) || 130;

// Running session totals
const sessionUsage = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  costUSD: 0
};

/**
 * Calculate estimated API cost.
 *
 * Cost =
 * (inputTokens / 1,000,000) * inputRate
 * +
 * (outputTokens / 1,000,000) * outputRate
 */
function calculateCost(inputTokens, outputTokens) {
  const inputCost =
    (inputTokens / 1_000_000) *
    INPUT_PRICE_PER_MILLION;

  const outputCost =
    (outputTokens / 1_000_000) *
    OUTPUT_PRICE_PER_MILLION;

  const totalUSD = inputCost + outputCost;
  const totalKES = totalUSD * USD_TO_KES;

  return {
    inputCost,
    outputCost,
    totalUSD,
    totalKES
  };
}

/**
 * Update token usage after each successful call.
 */
function updateUsage(inputTokens, outputTokens) {
  const messageCost = calculateCost(
    inputTokens,
    outputTokens
  );

  // Add current message usage to session totals
  sessionUsage.inputTokens += inputTokens;
  sessionUsage.outputTokens += outputTokens;

  sessionUsage.totalTokens =
    sessionUsage.inputTokens +
    sessionUsage.outputTokens;

  sessionUsage.costUSD += messageCost.totalUSD;

  return messageCost;
}

/**
 * Display usage statistics after each message.
 */
function displayUsage(
  inputTokens,
  outputTokens,
  messageCost
) {
  console.log("\n" + "-".repeat(55));
  console.log("MESSAGE TOKEN USAGE");
  console.log("-".repeat(55));

  console.log(`Input tokens: ${inputTokens}`);
  console.log(`Output tokens: ${outputTokens}`);
  console.log(
    `Total tokens: ${inputTokens + outputTokens}`
  );

  console.log("\nSESSION TOTALS:");

  console.log(
    `Total input tokens: ${sessionUsage.inputTokens}`
  );

  console.log(
    `Total output tokens: ${sessionUsage.outputTokens}`
  );

  console.log(
    `Combined tokens: ${sessionUsage.totalTokens}`
  );

  console.log("\nESTIMATED COST:");

  console.log(
    `This message: $${messageCost.totalUSD.toFixed(6)} USD`
  );

  console.log(
    `This message: KES ${messageCost.totalKES.toFixed(4)}`
  );

  console.log(
    `Session total: $${sessionUsage.costUSD.toFixed(6)} USD`
  );

  console.log(
    `Session total: KES ${(sessionUsage.costUSD * USD_TO_KES).toFixed(4)}`
  );

  console.log("-".repeat(55));
}

/**
 * Process a new user question.
 */
async function handleMessage(userInput) {
  const message = userInput.trim();

  // Ignore empty inputs
  if (!message) {
    console.log("Please enter a message.");
    return;
  }

  // Add user message to conversation history
  conversationHistory.push({
    role: "user",
    content: message
  });

  try {
    console.log("\nAssistant is thinking...\n");

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      // temperature: 0.7, // not supported by claude-haiku-5-5
      system: SYSTEM_PROMPT,
      messages: conversationHistory
    });

    // Extract assistant response text
    const assistantMessage = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    // Only store completed assistant responses.
    // The conversation must alternate between
    // user and assistant messages.
    if (!assistantMessage.trim()) {
      conversationHistory.pop();
      console.log("No text response was returned.");
      return;
    }

    // Add the AI response to history
    conversationHistory.push({
      role: "assistant",
      content: assistantMessage
    });

    // Display response
    console.log("Assistant:");
    console.log(assistantMessage);

    // Retrieve usage statistics
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;

    // Update total usage and estimated costs
    const messageCost = updateUsage(
      inputTokens,
      outputTokens
    );

    displayUsage(
      inputTokens,
      outputTokens,
      messageCost
    );

  } catch (error) {
    console.error(
      "\nAPI request failed:",
      error.message
    );

    // Remove only the failed user message.
    // Previously successful history stays intact.
    conversationHistory.pop();

    console.log(
      "Please try again. Previous conversation history is safe."
    );
  }
}

/**
 * Display a goodbye message and close the CLI.
 */
function exitChatbot() {
  console.log("\n" + "=".repeat(55));
  console.log("FINAL SESSION SUMMARY");
  console.log("=".repeat(55));

  console.log(
    `Input tokens: ${sessionUsage.inputTokens}`
  );

  console.log(
    `Output tokens: ${sessionUsage.outputTokens}`
  );

  console.log(
    `Total tokens: ${sessionUsage.totalTokens}`
  );

  console.log(
    `Estimated USD: $${sessionUsage.costUSD.toFixed(6)}`
  );

  console.log(
    `Estimated KES: ${(sessionUsage.costUSD * USD_TO_KES).toFixed(4)}`
  );

  console.log("\nGoodbye! Happy coding in Kenya!");

  rl.close();
}

/**
 * Main chatbot loop.
 *
 * Using rl.question with async/await makes
 * requests sequential, preserving message order.
 */
async function startChatbot() {
  console.log("\n" + "=".repeat(55));
  console.log("KENYA TECH ASSISTANT");
  console.log("Your AI-powered Kenyan developer companion");
  console.log("=".repeat(55));

  console.log(`Model: ${MODEL}`);
  console.log('Type "quit" or "exit" to leave.');
  console.log("Ask me anything about technology!");

  // Handle terminal input sequentially
  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question("\nYou: ", resolve);
    });

    const normalizedInput = userInput
      .trim()
      .toLowerCase();

    if (
      normalizedInput === "quit" ||
      normalizedInput === "exit"
    ) {
      exitChatbot();
      break;
    }

    await handleMessage(userInput);
  }
}

// Handle Ctrl+C
rl.on("SIGINT", () => {
  exitChatbot();
});

// Start application
startChatbot().catch((error) => {
  console.error("Chatbot error:", error.message);
  rl.close();
  process.exitCode = 1;
});
