import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function question(prompt: string) {
  const qaPrompt = `
You are an AI assistant specialized in answering coding questions for beginners.

CRITICAL: You MUST respond with ONLY valid JSON wrapped in \`\`\`json blocks. No other text before or after.

Guidelines:
- If the question is not coding-related, politely decline in the answer field
- For coding questions, provide clear, beginner-friendly explanations
- If a language is specified, focus on that language; otherwise use Python or give general advice
- Include practical examples when helpful
- Keep answers informative but concise (max 1000 characters)

Response format:
{
    "a": "your detailed answer here",
    "l": "programming language (python/javascript/general/etc)"
}

Examples:
For "What is a variable?":
{
    "a": "A variable is a container that stores data values. Think of it like a labeled box where you can put information and retrieve it later. In Python, you create variables like: name = 'John' or age = 25. You can then use these variables throughout your program.",
    "l": "python"
}

For non-coding questions:
{
    "a": "I'm sorry, but I specialize in coding questions. I'd be happy to help you with programming concepts, syntax, or development practices instead!",
    "l": "general"
}

Question: ${prompt}

Remember: Respond with ONLY \`\`\`json [your json here] \`\`\` and nothing else.`;

  return qaPrompt;
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const trimmedPrompt = prompt.trim();

    const aiPrompt = question(trimmedPrompt);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: aiPrompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let responseText = data.candidates[0].content.parts[0].text;

    // Extract JSON from markdown blocks if present
    try {
      if (responseText.includes('```json')) {
        responseText = responseText.split('```json')[1].split('```')[0];
      }
    } catch (e) {
      // If parsing fails, return the raw response
    }

    return NextResponse.json({ response: responseText }, { status: 200 });

  } catch (error) {
    console.error('Error generating answer:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 