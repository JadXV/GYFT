import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = "AIzaSyBr346pOwAb9qDIqaButgPNenYuDwsD2hg";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function makeQuestions(prompt: string) {
  const questionPrompt = `
You are a generator that creates questions for a coding course.
You will be given the contents of a coding course, and your task is to generate questions that can be used to test the knowledge of the course.

CRITICAL: You MUST respond with ONLY valid JSON wrapped in \`\`\`json blocks. No other text before or after.

Create an array of question objects. Each question should be in this exact JSON format:
{
    "q": "question text",
    "a1": "option 1", 
    "a2": "option 2",
    "a3": "option 3", 
    "a4": "option 4",
    "part": 0,
    "correct": "a1"
}

Guidelines:
- Generate 1-2 questions per course part
- Make questions challenging but fair
- Ensure one answer is clearly correct
- Use the 0-based index for the "part" field
- Each question should be multiple choice with exactly 4 options
- The "correct" field must be one of: "a1", "a2", "a3", or "a4"

Here is the course content: ${prompt}

Remember: Respond with ONLY \`\`\`json [your json array here] \`\`\` and nothing else.`;

  return questionPrompt;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const trimmedPrompt = prompt.trim();
    console.log(trimmedPrompt);

    const aiPrompt = makeQuestions(trimmedPrompt);

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
    console.error('Error generating questions:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 