import "dotenv/config";

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama3-70b-8192",
  "mixtral-8x7b-32768",
];

async function callGroq(messages, modelIndex = 0) {
  if (modelIndex >= GROQ_MODELS.length) {
    throw new Error("All models are busy. Try again in a moment!");
  }

  const model = GROQ_MODELS[modelIndex];
  console.log(`🤖 Trying model: ${model}`);

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1024
    })
  });

  const data = await response.json();

  if (data.error) {
    console.log(`⚠️ ${model} failed: ${data.error.message} — trying next...`);
    return callGroq(messages, modelIndex + 1);
  }

  console.log(`✅ Success with: ${model}`);
  return data.choices[0].message.content;
}

export async function reviewCode(code, language, history) {
  const messages = [
    {
      role: "system",
      content: `You are a friendly code mentor helping beginners learn programming.
When given code:
1. Explain what it does in simple terms
2. Point out errors or improvements (be encouraging, not harsh)
3. Give one small practice exercise
Keep it short and beginner-friendly.`
    },
    ...history,
    {
      role: "user",
      content: `Review this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``
    }
  ];

  return callGroq(messages);
}