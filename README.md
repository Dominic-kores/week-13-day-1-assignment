
# Kenya AI Lab – LLM API Exploration

## Overview
The project demonstrates how developers can
integrate Large Language Models (LLMs) into
applications using the Anthropic and OpenAI APIs.

It also includes an interactive Kenyan Tech
Assistant that maintains conversation history
and tracks API token consumption.

## Project Objectives

- Understand LLM API integration.
- Send requests using the Anthropic SDK.
- Send requests using the OpenAI SDK.
<!-- - Explore system prompts and temperature settings. //Claude Haiku 5.5 does not support temparature parameter -->
- Compare AI models using response time and tokens.
- Build a CLI chatbot using Node.js readline.
- Maintain multi-turn conversation history.
- Estimate API costs in USD and KES.
- Handle API errors gracefully.

## Technologies

- JavaScript (CommonJS)
- Node.js
- Anthropic SDK
- OpenAI SDK
- dotenv
- readline
- Node.js File System

## Project Structure

    week-13-day-1-assignment/
    ├── results/
    │   ├── anthropic-results.json
    │   ├── openai-results.json
    │   └── comparison.md
    ├── experiments.js
    ├── explore-anthropic.js
    ├── explore-openai.js
    ├── chatbot.js
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── package.json
    └── README.md

The result files are generated after
successfully running the experiments.

## Installation

Clone the repository:

    git clone <https://github.com/Dominic-kores/week-13-day-1-assignment>

Navigate to the project:

    cd week-13-day-1-assignment

Install dependencies:

    npm install

Create a .env file based on .env.example:

    ANTHROPIC_API_KEY=your_key
    OPENAI_API_KEY=your_key
    ANTHROPIC_MODEL=claude-haiku-5-5
    OPENAI_MODEL=gpt-4o-mini
    USD_TO_KES=130

Use a currently available Claude model
if the assignment's model is retired.

## Task 1 – Anthropic Exploration

Execute five Claude API calls with different
temperatures, prompts, and token limits.

Run:

    npm run anthropic

The program displays responses, token usage,
stop reasons, and response times.

## Task 2 – OpenAI Exploration

Repeat the same five experiments using GPT.

Run:

    npm run openai

The application compares both providers and
generates a Markdown comparison table.

## Task 3 – CLI Chatbot

Run:

    npm run chat

The Kenyan Tech Assistant supports:

- Multi-turn conversations
- Context-aware responses
- Terminal input and output
- Error handling
- Quit and exit commands
- Token and cost tracking

## Bonus – API Cost Tracking

The chatbot calculates:

- Input token usage
- Output token usage
- Cumulative session tokens
- Estimated cost in USD
- Estimated cost in KES

Assignment pricing assumptions:

Input: $3 per million tokens
Output: $15 per million tokens
Exchange rate: 1 USD = 130 KES

Actual provider billing may differ.

## Experiment Analysis

The project compares model responses across
five tasks:

1. Factual question answering
2. Creative writing
3. Brainstorming
4. Text classification
5. JavaScript code generation

Response times and token consumption are
recorded automatically.

Response quality is evaluated manually
based on accuracy, clarity, creativity,
and code correctness.


## Security

API keys are stored in environment variables.

The .env file and node_modules directory
are excluded from Git version control.

Never commit or expose API keys.

## Key Learnings

This project strengthened my understanding
of how Large Language Models are integrated
into real-world software applications.

I learned how to configure API requests,
compare AI providers, manage conversation
history, measure token consumption, and
build interactive AI-powered terminal tools.




## Author

Dominic Kores

Full-Stack Software & AI Engineer


