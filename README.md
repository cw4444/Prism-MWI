# Prism - Alternate Timeline Explorer

Inspired by Ted Chiang's *"Anxiety Is the Dizziness of Freedom"*. Write a diary entry about something that happened and the Prism generates 5 alternate timelines where things went differently.

## Setup

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## API Keys

Supports **Anthropic (Claude)** and **OpenAI (GPT)**. You can either:
- Paste your key directly into the settings bar in the UI
- Create a `.env` file in the project root:
  ```
  VITE_ANTHROPIC_API_KEY=sk-ant-...
  VITE_OPENAI_API_KEY=sk-...
  ```

## How It Works

Write about an event — a decision, a conversation, a moment. Hit "Activate Prism" and it generates 5 parallel timeline diary entries, ordered from barely-different to radically-different, each with a branch point, mood, and divergence score.

Built with React + Vite.
