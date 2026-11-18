
require("dotenv").config();

const OpenAI = require("openai");
const fs = require("node:fs");
const path = require("node:path");

const experiments = require("./experiments");

// Validate API credentials
if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env");
  process.exit(1);
}

// Initialize OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const MODEL =
  process.env.OPENAI_MODEL || "gpt-4o-mini";

const resultsDirectory = path.join(
  __dirname,
  "results"
);

const openaiResults = [];

/**
 * Execute one experiment using GPT.
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

  const startTime = Date.now();

  try {
    const completion =
      await client.chat.completions.create({
        model: MODEL,
        temperature,
        max_tokens: maxTokens,
        messages: [
          {
            role: "system",
            content: system
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

    const responseTime = Number(
      ((Date.now() - startTime) / 1000).toFixed(2)
    );

    // OpenAI response structure
    const responseText =
      completion.choices[0]?.message?.content || "";

    const inputTokens =
      completion.usage?.prompt_tokens ?? 0;

    const outputTokens =
      completion.usage?.completion_tokens ?? 0;

    const stopReason =
      completion.choices[0]?.finish_reason;

    const result = {
      call: id,
      provider: "OpenAI",
      model: completion.model,
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
      stopReason
    };

    openaiResults.push(result);

    console.log("\nGPT RESPONSE:");
    console.log(responseText);

    console.log("\nUSAGE STATISTICS:");
    console.log(`Input tokens: ${inputTokens}`);
    console.log(`Output tokens: ${outputTokens}`);
    console.log(
      `Total tokens: ${inputTokens + outputTokens}`
    );
    console.log(`Finish reason: ${stopReason}`);
    console.log(`Response time: ${responseTime}s`);

    return result;
  } catch (error) {
    console.error(
      `OpenAI call ${id} failed:`,
      error.message
    );

    return null;
  }
}

/**
 * Build a Markdown comparison table.
 */
function generateComparisonTable(
  anthropicResults,
  gptResults
) {
  const rows = [];

  rows.push("# Anthropic vs OpenAI API Comparison");
  rows.push("");
  rows.push(
    "| Call | Provider | Input Tokens | Output Tokens | Response Time |"
  );
  rows.push(
    "|---|---|---:|---:|---:|"
  );

  for (const experiment of experiments) {
    const claude = anthropicResults.find(
      (item) => item.call === experiment.id
    );

    const gpt = gptResults.find(
      (item) => item.call === experiment.id
    );

    if (claude) {
      rows.push(
        `| ${experiment.id} | Anthropic | ${claude.inputTokens} | ${claude.outputTokens} | ${claude.responseTime}s |`
      );
    }

    if (gpt) {
      rows.push(
        `| ${experiment.id} | OpenAI | ${gpt.inputTokens} | ${gpt.outputTokens} | ${gpt.responseTime}s |`
      );
    }
  }

  return rows.join("\n");
}

/**
 * Print provider statistics and identify
 * which provider performed faster.
 */
function compareProviders(
  anthropicResults,
  gptResults
) {
  console.log("\n" + "=".repeat(65));
  console.log("PROVIDER PERFORMANCE COMPARISON");
  console.log("=".repeat(65));

  for (const experiment of experiments) {
    const claude = anthropicResults.find(
      (item) => item.call === experiment.id
    );

    const gpt = gptResults.find(
      (item) => item.call === experiment.id
    );

    if (!claude || !gpt) {
      console.log(
        `Call ${experiment.id}: Missing provider results`
      );
      continue;
    }

    const faster =
      claude.responseTime < gpt.responseTime
        ? "Anthropic"
        : gpt.responseTime < claude.responseTime
          ? "OpenAI"
          : "Tie";

    const fewerTokens =
      claude.totalTokens < gpt.totalTokens
        ? "Anthropic"
        : gpt.totalTokens < claude.totalTokens
          ? "OpenAI"
          : "Tie";

    console.log(`\nCall ${experiment.id}: ${experiment.category}`);
    console.log(`Faster provider: ${faster}`);
    console.log(`Fewer total tokens: ${fewerTokens}`);
  }

  const average = (items, field) =>
    items.length
      ? items.reduce(
          (sum, item) => sum + item[field],
          0
        ) / items.length
      : 0;

  console.log("\nAVERAGE RESPONSE TIMES:");
  console.log(
    `Anthropic: ${average(anthropicResults, "responseTime").toFixed(2)}s`
  );
  console.log(
    `OpenAI: ${average(gptResults, "responseTime").toFixed(2)}s`
  );

  console.log("\nQUALITY REVIEW:");
  console.log(
    "Compare factual accuracy, creativity, classification accuracy, and code quality manually."
  );
}

/**
 * Main program
 */
async function main() {
  console.log("KENYA AI LAB");
  console.log("Task 2: OpenAI API Exploration");
  console.log(`Model: ${MODEL}`);

  fs.mkdirSync(resultsDirectory, {
    recursive: true
  });

  // Execute the same five prompts
  for (const experiment of experiments) {
    await runExperiment(experiment);
  }

  const openaiPath = path.join(
    resultsDirectory,
    "openai-results.json"
  );

  fs.writeFileSync(
    openaiPath,
    JSON.stringify(openaiResults, null, 2)
  );

  // Load saved Anthropic results from Task 1
  const anthropicPath = path.join(
    resultsDirectory,
    "anthropic-results.json"
  );

  if (!fs.existsSync(anthropicPath)) {
    console.log(
      "\nAnthropic results not found."
    );
    console.log(
      "Run npm run anthropic first to compare providers."
    );
    return;
  }

  const anthropicResults = JSON.parse(
    fs.readFileSync(anthropicPath, "utf8")
  );

  const markdown = generateComparisonTable(
    anthropicResults,
    openaiResults
  );

  console.log("\n" + markdown);

  const comparisonPath = path.join(
    resultsDirectory,
    "comparison.md"
  );

  fs.writeFileSync(comparisonPath, markdown);

  compareProviders(
    anthropicResults,
    openaiResults
  );

  console.log("\nSaved comparison to:");
  console.log(comparisonPath);
}

main().catch((error) => {
  console.error("Unexpected error:", error.message);
  process.exitCode = 1;
});
