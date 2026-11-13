
/**
 * Kenya AI Lab - Shared LLM Experiments
 *
 * Both Claude and GPT use these configurations
 * to keep the comparison consistent.
 */

const experiments = [
  {
    id: 1,
    name: "Low temperature - Factual",
    category: "Factual",
    temperature: 0,
    maxTokens: 200,
    system:
      "You are a geography expert. Answer factually and concisely.",
    prompt:
      "What are the top 5 most populated cities in Kenya?"
  },

  {
    id: 2,
    name: "Medium temperature - Creative",
    category: "Creative",
    temperature: 0.5,
    maxTokens: 500,
    system:
      "You are a creative writer specializing in East African stories.",
    prompt:
      "Write a short paragraph about a morning in Nairobi."
  },

  {
    id: 3,
    name: "High temperature - Brainstorming",
    category: "Brainstorming",
    temperature: 1.0,
    maxTokens: 800,
    system:
      "You are a startup advisor in Nairobi. Be creative and unconventional.",
    prompt:
      "Suggest 5 unique app ideas for Kenyan university students."
  },

  {
    id: 4,
    name: "Low temperature - Classification",
    category: "Classification",
    temperature: 0,
    maxTokens: 50,
    system:
      "You classify customer messages. Respond with only one word: complaint, inquiry, or praise.",
    prompt:
      "Your M-Pesa integration keeps failing every time I try to pay."
  },

  {
    id: 5,
    name: "Medium temperature - Code generation",
    category: "Code Generation",
    temperature: 0.3,
    maxTokens: 600,
    system:
      "You are a Node.js expert. Write clean, commented code.",
    prompt:
      "Write a function that formats a Kenyan phone number from 07XX to +254XX format."
  }
];

// Export configurations for other files
module.exports = experiments;
