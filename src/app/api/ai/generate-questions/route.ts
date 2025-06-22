import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function makeQuestions(prompt: string) {
  const questionPrompt = `
You are an expert quiz generator for programming and technical courses. 
You will be given the contents of a coding course, and your task is to generate EXACTLY 3 high-quality questions that test understanding of the material.

CRITICAL: You MUST respond with ONLY valid JSON wrapped in \`\`\`json blocks. No other text before or after.

Create an array of exactly 3 question objects. Each question should be in this exact JSON format:
{
    "q": "Clear, specific question text that tests understanding",
    "a1": "First option", 
    "a2": "Second option",
    "a3": "Third option", 
    "a4": "Fourth option",
    "part": 0,
    "correct": "a1"
}

Question Generation Guidelines:
- Generate EXACTLY 3 questions total, not per section
- Mix question types: conceptual understanding, practical application, code analysis
- Make questions challenging but fair and answerable from the content
- Ensure exactly one answer is clearly correct
- Make wrong answers plausible but clearly incorrect
- Focus on key concepts, syntax, best practices, and problem-solving
- Questions should test different aspects of the material
- Use the 0-based index (0, 1, 2) for the "part" field
- Each question should be multiple choice with exactly 4 options
- The "correct" field must be one of: "a1", "a2", "a3", or "a4"

Examples of good question types:
- "What is the primary purpose of [concept] in [language]?"
- "Which of the following code snippets correctly demonstrates [technique]?"
- "What would be the output of the following code?"
- "Which approach is considered best practice for [scenario]?"

Here is the course content: ${prompt}

Remember: Respond with ONLY \`\`\`json [your json array here] \`\`\` and nothing else.`;

  return questionPrompt;
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
        responseText = responseText.split('```json')[1].split('```')[0].trim();
      } else if (responseText.includes('```')) {
        // Handle case where json keyword is missing
        const codeBlocks = responseText.split('```');
        if (codeBlocks.length >= 3) {
          responseText = codeBlocks[1].trim();
        }
      }

      // Validate that it's actually valid JSON
      JSON.parse(responseText);
      
    } catch (e) {
      console.error('JSON parsing error:', e);
      console.error('Raw response:', responseText);
      // Try to extract JSON from the response if it's malformed
      try {
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          responseText = jsonMatch[0];
          JSON.parse(responseText); // Validate
        }
      } catch (secondError) {
        return NextResponse.json({ 
          error: 'Failed to parse AI response as valid JSON',
          raw_response: responseText 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ response: responseText }, { status: 200 });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred while generating questions' 
    }, { status: 500 });
  }
} 