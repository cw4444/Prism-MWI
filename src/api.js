const SYSTEM_PROMPT = `You are a Prism device from a universe where the Many-Worlds Interpretation is observable. Given a diary entry describing a real event or decision, you generate alternate timeline versions — plausible parallel realities where things went differently.

For each timeline, imagine a specific branching point where a small quantum divergence led to a different outcome. The divergences should range from subtly different to dramatically different, but all must feel grounded and psychologically realistic.

You must respond with EXACTLY a JSON array of 5 objects. Each object has:
- "timeline_id": a string like "T-001A" through "T-001E"
- "branch_point": a one-sentence description of where this timeline diverged (written as a brief, evocative observation)
- "entry": the diary entry as it would read in THAT alternate timeline, written in first person from the diarist's perspective, matching their voice and tone. Keep it roughly the same length as the original. Make it feel lived-in and real — not a summary, but an actual diary entry from that other life.
- "mood": one word capturing the emotional tone (e.g., "bittersweet", "triumphant", "hollow", "serene", "restless")
- "divergence": a float from 0.0 to 1.0 indicating how far this timeline drifted from the original (0.1 = barely different, 0.9 = radically different)

Order them from lowest to highest divergence. Respond with ONLY the JSON array, no other text.`;

export async function generateTimelines(entry, { provider, apiKey, model }) {
  if (provider === 'anthropic') {
    return callAnthropic(entry, apiKey, model);
  } else {
    return callOpenAI(entry, apiKey, model);
  }
}

async function callAnthropic(entry, apiKey, model) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Here is my diary entry:\n\n${entry}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  return parseTimelines(text);
}

async function callOpenAI(entry, apiKey, model) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Here is my diary entry:\n\n${entry}` },
      ],
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;
  return parseTimelines(text);
}

function parseTimelines(text) {
  // Extract JSON array from the response, handling possible markdown code blocks
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse timeline data from API response');
  }
  const timelines = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(timelines) || timelines.length === 0) {
    throw new Error('Invalid timeline data received');
  }
  return timelines;
}
