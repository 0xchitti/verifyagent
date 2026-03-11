/**
 * AI-powered evaluation of task delivery quality.
 * Uses structured analysis to determine if delivery meets task requirements.
 */

/**
 * Evaluate a delivery against a task description.
 * @param {string} task - The task description / requirements
 * @param {string} delivery - The delivered result
 * @returns {Object} verdict, qualityScore (0-100), reasoning, details
 */
export async function evaluate(task, delivery) {
  // Structured evaluation criteria
  const criteria = [
    { name: "relevance", weight: 0.3, description: "Does the delivery address what was asked?" },
    { name: "completeness", weight: 0.25, description: "Are all parts of the task covered?" },
    { name: "accuracy", weight: 0.25, description: "Is the information/work correct?" },
    { name: "quality", weight: 0.2, description: "Is the work well-executed?" },
  ];

  // Try providers in order: Venice (hackathon partner) > Anthropic > heuristic
  const veniceKey = process.env.VENICE_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (veniceKey) {
    return await evaluateWithVenice(task, delivery, criteria, veniceKey);
  }
  if (anthropicKey) {
    return await evaluateWithLLM(task, delivery, criteria, anthropicKey);
  }

  // Fallback: heuristic evaluation
  return evaluateHeuristic(task, delivery, criteria);
}

async function evaluateWithVenice(task, delivery, criteria, apiKey) {
  const prompt = buildEvalPrompt(task, delivery, criteria);

  const response = await fetch("https://api.venice.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.1,
    }),
  });

  if (!response.ok) throw new Error(`Venice API error: ${response.status}`);
  const data = await response.json();
  const text = data.choices[0].message.content.trim();
  return parseEvalResponse(text, criteria, "venice", "llama-3.3-70b");
}

function buildEvalPrompt(task, delivery, criteria) {
  return `You are a verification oracle. Evaluate whether a delivery meets the task requirements.

TASK:
${task}

DELIVERY:
${delivery}

Evaluate on these criteria (score each 0-100):
${criteria.map(c => `- ${c.name} (weight ${c.weight}): ${c.description}`).join("\n")}

Respond in this exact JSON format:
{
  "scores": {
    "relevance": <0-100>,
    "completeness": <0-100>,
    "accuracy": <0-100>,
    "quality": <0-100>
  },
  "reasoning": "<2-3 sentence explanation>",
  "issues": ["<issue 1>", "<issue 2>"] or [],
  "verdict": "pass" | "fail" | "partial"
}

Rules:
- "pass" = score >= 70 overall and no critical issues
- "partial" = score 40-69 or minor issues
- "fail" = score < 40 or critical issues (wrong, incomplete, irrelevant)
- Be honest and strict. Don't pass garbage.

Return ONLY valid JSON.`;
}

function parseEvalResponse(text, criteria, provider, model) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse LLM response as JSON");

  const result = JSON.parse(jsonMatch[0]);
  const weightedScore = Math.round(
    criteria.reduce((sum, c) => sum + (result.scores[c.name] || 0) * c.weight, 0)
  );

  const verdictMap = { pass: "Pass", fail: "Fail", partial: "Partial" };
  const verdict = verdictMap[result.verdict] || "Partial";

  return {
    verdict,
    qualityScore: weightedScore,
    reasoning: result.reasoning,
    details: {
      scores: result.scores,
      issues: result.issues || [],
      evaluationMethod: "ai",
      provider,
      model,
    },
  };
}

async function evaluateWithLLM(task, delivery, criteria, apiKey) {
  const prompt = buildEvalPrompt(task, delivery, criteria);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
  const data = await response.json();
  const text = data.content[0].text.trim();
  return parseEvalResponse(text, criteria, "anthropic", "claude-sonnet-4-20250514");
}

function evaluateHeuristic(task, delivery, criteria) {
  // Basic heuristic: check length, keyword overlap, etc.
  const taskWords = new Set(task.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const deliveryWords = new Set(delivery.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  // Word overlap as proxy for relevance
  let overlap = 0;
  for (const word of taskWords) {
    if (deliveryWords.has(word)) overlap++;
  }
  const relevanceScore = taskWords.size > 0
    ? Math.min(100, Math.round((overlap / taskWords.size) * 100 * 1.5))
    : 50;

  // Length as proxy for completeness
  const lengthRatio = delivery.length / Math.max(task.length, 1);
  const completenessScore = Math.min(100, Math.round(lengthRatio * 50));

  // Can't assess accuracy without AI, default to neutral
  const accuracyScore = 50;

  // Quality based on basic formatting
  const qualityScore = delivery.length > 20 ? 60 : 30;

  const weightedScore = Math.round(
    relevanceScore * 0.3 +
    completenessScore * 0.25 +
    accuracyScore * 0.25 +
    qualityScore * 0.2
  );

  let verdict = "Partial";
  if (weightedScore >= 70) verdict = "Pass";
  if (weightedScore < 40) verdict = "Fail";

  return {
    verdict,
    qualityScore: weightedScore,
    reasoning: `Heuristic evaluation: ${relevanceScore}% relevance, ${completenessScore}% completeness. AI evaluation unavailable.`,
    details: {
      scores: {
        relevance: relevanceScore,
        completeness: completenessScore,
        accuracy: accuracyScore,
        quality: qualityScore,
      },
      issues: ["Heuristic evaluation only. Set ANTHROPIC_API_KEY for AI-powered verification."],
      evaluationMethod: "heuristic",
    },
  };
}
