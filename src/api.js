const BASE_PROMPT = `You are a Prism device from a universe where the Many-Worlds Interpretation is observable. You receive a diary entry from ONE reality. Your job is to show 5 COMPLETELY DIFFERENT realities happening simultaneously — not variations of the same event, but entirely unrelated lives.

CRITICAL RULES:
- The input entry is just a snapshot of ONE person's reality at this moment. The 5 timelines you generate must show 5 OTHER people living 5 COMPLETELY DIFFERENT lives. Different jobs, different cities, different problems, different joys.
- DO NOT riff on the original topic. The 5 timelines must have ZERO thematic connection to the input entry. If the input is about job hunting, your outputs must NOT be about job hunting, careers, or anything related. They should be about moving to a new country, or winning a dance competition, or recovering from surgery, or finding a stray dog, or literally anything else.
- Each timeline is its own person with its own completely unrelated life. The ONLY thing they share with the original entry is: they are a human being writing a diary entry on the same day in a parallel universe. Nothing else connects them.
- Make the entries feel raw, real, and specific. Use concrete details — names, places, brands, slang. These are real people writing for themselves, not performing for an audience.
- Vary the emotional range wildly. One might be ecstatic, another devastated, another bored, another confused, another at peace.
- Vary the writing styles. Some people write long rambling entries. Some write terse fragments. Some swear a lot. Some are poetic. Match the voice to the person.
- Keep entries roughly the same length as the original input.

You must respond with EXACTLY a JSON array of 5 objects. Each object has:
- "timeline_id": a string like "T-001A" through "T-001E"
- "branch_point": a one-sentence poetic observation about where this universe diverged from the others (NOT about the original entry — about this person's life)
- "entry": a first-person diary entry from a completely different person in a completely different situation. Make it feel lived-in and real.
- "mood": one word capturing the emotional tone (e.g., "bittersweet", "triumphant", "hollow", "serene", "restless", "manic", "numb")
- "divergence": a float from 0.0 to 1.0 indicating how emotionally/thematically far this timeline is from the original (always spread across the full range — at least one near 0.3, one near 0.9)

Order them from lowest to highest divergence. Respond with ONLY the JSON array, no other text.`;

const DISTORTION_DESCRIPTIONS = {
  time_shift: 'REALITY DISTORTION — Time Shift: Some of these parallel people are experiencing time strangely. Maybe someone is reliving a day, or they wrote this entry before the events happened, or their past and present are bleeding together. Weave it in naturally — they might not even notice.',
  identity_swap: 'REALITY DISTORTION — Identity Swap: Some of these parallel people are uncertain about who they are. Maybe they woke up in someone else\'s life, or they\'re realizing they\'ve been someone different all along. The diary captures the fracture.',
  motivation_inversion: 'REALITY DISTORTION — Motivation Inversion: These parallel people are driven by the opposite of what you\'d expect. Someone at a wedding wants it to fail. Someone who got fired is relieved. Someone who found love is terrified. Their desires are inverted and they may or may not realize it.',
  physics_tweak: 'REALITY DISTORTION — Physics Tweak: In these parallel realities, something about the physical world is subtly off. Maybe shadows fall wrong, or sounds arrive before their source, or objects are heavier than they should be. The diarists notice in passing, as if it\'s always been this way. Don\'t explain it.',
  observer_change: 'REALITY DISTORTION — Observer Change: Some of these entries are NOT written by humans. They might be from an animal, an AI, a building, a ghost, or something that doesn\'t have a word yet. But they\'re still diary entries, still personal, still real to whatever is writing them.',
};

const CONSTRAINT_DESCRIPTIONS = {
  cant_speak: 'CONSTRAINT — Every person across these realities cannot speak. They are mute, silenced, or have lost their voice. Their diary entries reflect how they navigate a world where they can\'t verbally communicate — and what that costs or reveals.',
  know_outcome: 'CONSTRAINT — Every person across these realities already knows how their day ends. They carry foreknowledge — maybe dread, maybe relief, maybe numbness. The entries are colored by certainty about what comes next.',
  external_control: 'CONSTRAINT — Every person across these realities senses that someone or something else is controlling events around them. They feel like puppets, test subjects, or characters in someone else\'s story. Their diaries reflect that creeping loss of agency.',
  unreliable_memory: 'CONSTRAINT — Every person across these realities has unreliable memory. Their diary entries contain contradictions, corrections, second-guessing. Details shift mid-sentence. They\'re writing partly to pin down what actually happened before they forget or misremember again.',
  being_watched: 'CONSTRAINT — Every person across these realities knows or suspects they are being watched. Surveillance — by a person, a system, or something unnamed — shapes how honestly they write. Some are paranoid, some are performing, some have given up caring.',
};

const OUTCOME_DESCRIPTIONS = {
  quiet_tragedy: 'OUTCOME TONE — Quiet Tragedy: Every entry should land with understated sadness. No melodrama — just the slow, clear ache of ordinary loss. The kind of hurt you only fully feel hours later, alone.',
  cosmic_horror: 'OUTCOME TONE — Cosmic Horror: Every entry should carry a creeping sense that something vast and incomprehensible lurks just beyond the edges of their ordinary lives. The wrongness is felt, not explained. Reality itself feels thin.',
  absurd_comedy: 'OUTCOME TONE — Absurd Comedy: Every entry should be ridiculous. Escalating absurdity delivered with total deadpan sincerity. These people\'s lives are objectively insane but they\'re writing about it like it\'s Tuesday.',
  bittersweet_acceptance: 'OUTCOME TONE — Bittersweet Acceptance: Every entry should end in a place of weary peace. Things aren\'t perfect — maybe they\'re quite bad — but each person has found a way to hold it. There is grace in the letting go.',
  inevitable: 'OUTCOME TONE — "This Was Inevitable": Every entry should feel like it was always going to end up here. Each person, no matter how different their life, arrives at a strangely similar emotional conclusion. Fate with a lowercase f.',
};

function buildSystemPrompt({ distortion, constraint, outcomeStyle }) {
  let prompt = BASE_PROMPT;

  if (distortion && DISTORTION_DESCRIPTIONS[distortion]) {
    prompt += '\n\n' + DISTORTION_DESCRIPTIONS[distortion];
  }
  if (constraint && CONSTRAINT_DESCRIPTIONS[constraint]) {
    prompt += '\n\n' + CONSTRAINT_DESCRIPTIONS[constraint];
  }
  if (outcomeStyle && OUTCOME_DESCRIPTIONS[outcomeStyle]) {
    prompt += '\n\n' + OUTCOME_DESCRIPTIONS[outcomeStyle];
  }

  return prompt;
}

export async function generateTimelines(entry, { provider, apiKey, model, distortion, constraint, outcomeStyle }) {
  const systemPrompt = buildSystemPrompt({ distortion, constraint, outcomeStyle });
  if (provider === 'anthropic') {
    return callAnthropic(entry, apiKey, model, systemPrompt);
  } else {
    return callOpenAI(entry, apiKey, model, systemPrompt);
  }
}

async function callAnthropic(entry, apiKey, model, systemPrompt) {
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
      system: systemPrompt,
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

async function callOpenAI(entry, apiKey, model, systemPrompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
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
