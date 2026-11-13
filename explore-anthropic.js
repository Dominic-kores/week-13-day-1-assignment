
require("dotenv").config();

const Anthropic = require("@anthropic-ai/sdk");
const fs = require("node:fs");
const path = require("node:path");

const experiments = require("./experiments");

// Ensure the API key exists before making requests
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY in .env");
  process.exit(1);
}

// Initialize Claude
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const MODEL =
  process.env.ANTHROPIC_MODEL ||
  "claude-haiku-5-5";

// Store the results from all experiments
const results = [];

/**
 * Make one API request to Claude.
 */
async function runExperiment(experiment) {
  const {
    id,
    name,
    category,
    temperature,
    maxTokens,
    system,
    prompt
  } = experiment;

  console.log("\n" + "=".repeat(65));
  console.log(`CALL ${id}: ${name}`);
  console.log("=".repeat(65));

  console.log(`Temperature: ${temperature}`);
  console.log(`Maximum tokens: ${maxTokens}`);
  console.log(`Prompt: ${prompt}`);

  // Start measuring the API response time
  const startTime = Date.now();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      // temperature: temperature, // not supported by claude-haiku-5-5
      system: system,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Calculate response time in seconds
    const responseTime = Number(
      ((Date.now() - startTime) / 1000).toFixed(2)
    );

    // Extract text from Claude's content blocks
    const responseText = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;

    const result = {
      call: id,
      provider: "Anthropic",
      model: response.model,
      name,
      category,
      temperature,
      maxTokens,
      prompt,
      response: responseText,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      responseTime,
      stopReason: response.stop_reason
    };

    results.push(result);

    // Display full response and usage information
    console.log("\nCLAUDE RESPONSE:");
    console.log(responseText);

    console.log("\nUSAGE STATISTICS:");
    console.log(`Input tokens: ${inputTokens}`);
    console.log(`Output tokens: ${outputTokens}`);
    console.log(
      `Total tokens: ${inputTokens + outputTokens}`
    );
    console.log(`Stop reason: ${response.stop_reason}`);
    console.log(`Response time: ${responseTime}s`);

    return result;
  } catch (error) {
    console.error(
      `Call ${id} failed:`,
      error.message
    );

    // Continue with the remaining experiments
    return null;
  }
}

/**
 * Summarize how temperature affected the outputs.
 */
function printTemperatureSummary() {
  console.log("\n" + "=".repeat(65));
  console.log("ANTHROPIC TEMPERATURE COMPARISON");
  console.log("=".repeat(65));

  results.forEach((result) => {
    console.log(
      `\nCall ${result.call} | ${result.category}`
    );
    // console.log(
    //   `Temperature: ${result.temperature}`
    // );
    console.log(
      `Output tokens: ${result.outputTokens}`
    );
    console.log(
      `Response time: ${result.responseTime}s`
    );
  });

  if (!results.length) {
    console.log("No successful experiments.");
    return;
  }

  // Identify the response with the most output tokens
  const mostTokens = results.reduce((a, b) =>
    a.outputTokens > b.outputTokens ? a : b
  );

  console.log("\nMOST OUTPUT TOKENS:");
  console.log(
    `Call ${mostTokens.call}: ${mostTokens.outputTokens} tokens`
  );

  console.log("\nOBSERVATIONS:");
  console.log(
    "Temperature 0 generally produces more focused outputs."
  );
  console.log(
    "Temperature 0.5 allows moderate variation."
  );
  console.log(
    "Temperature 1.0 encourages more varied responses."
  );
  console.log(
    "Review the actual text to judge creativity and quality."
  );
}

/**
 * Main application
 */
async function main() {
  console.log("KENYA AI LAB");
  console.log("Task 1: Anthropic API Exploration");
  console.log(`Model: ${MODEL}`);

  for (const experiment of experiments) {
    await runExperiment(experiment);
  }

  // Create results directory if missing
  const outputDir = path.join(__dirname, "results");

  fs.mkdirSync(outputDir, { recursive: true });

  // Save results for Task 2 comparison
  const outputPath = path.join(
    outputDir,
    "anthropic-results.json"
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(results, null, 2)
  );

  printTemperatureSummary();

  console.log("\nResults saved to:");
  console.log(outputPath);

  console.log(
    `\nSuccessful calls: ${results.length}/5`
  );
}

main().catch((error) => {
  console.error("Unexpected error:", error.message);
  process.exitCode = 1;
});
