import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = "AIzaSyBr346pOwAb9qDIqaButgPNenYuDwsD2hg";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function courseGen(prompt: string) {
  const prompta = `
You are a coding course writer. You write courses that teach coding to beginners.
You will be given a prompt that describes the course you need to write.

CRITICAL: You MUST respond with ONLY valid JSON wrapped in \`\`\`json blocks. No other text before or after.
For each course, you will create a w3school-style course outline with a title, description, language, and structured parts.

A section's content, "c", MUST be an array of objects. Each object can be a paragraph or a code block.
- For a paragraph, use: { "type": "p", "text": "your paragraph text here" }
- For a code block, use: { "type": "code", "lang": "language-name", "code": "your code here" }

Your task is to generate a course outline in JSON format with the following structure (This is an example of a Python course, the contents are single sentences, but you HAVE to write detailed explinations and examples):
{
    "t": "Python for Beginners: A Comprehensive Introduction",
    "d": "This course provides a friendly and accessible introduction to Python programming. Learn the fundamentals of Python syntax, data structures, control flow, and object-oriented programming. Build practical projects to solidify your understanding and gain the skills necessary to write your own Python programs.",
    "l": "python",
    "c": [
        {
            "n": "Part 1: Getting Started with Python",
            "d": "Introduction to Python, installation, setting up a development environment, and basic syntax. Covering variables, data types (integers, floats, strings, booleans), and simple operations. Using the print() function. Examples: simple calculations, string concatenation, and basic input using input().",
            "s": [
                {
                    "t": "Introduction to Python",
                    "c": [
                        { "type": "p", "text": "Python is a high-level, interpreted programming language known for its readability and simple syntax. It was created by Guido van Rossum and first released in 1991." },
                        { "type": "p", "text": "It is used in web development, data science, artificial intelligence, and more. This section will introduce you to the fundamental concepts of Python." },
                        { "type": "code", "lang": "python", "code": "print('Hello, World!')" },
                        { "type": "p", "text": "The code above is a simple Python program that prints 'Hello, World!' to the console. The print() function is a built-in function that outputs text." }
                    ]
                },
                {
                    "t": "Setting up your Environment",
                    "c": [{ "type": "p", "text": "Installing Python, choosing an IDE (VS Code, PyCharm), running your first Python program."}]
                },
                {
                    "t": "Variables and Data Types",
                    "c": [{ "type": "p", "text": "Understanding variables, assigning values, exploring integers, floats, strings, and booleans."}]
                },
                {
                    "t": "Basic Operations",
                    "c": [{"type": "p", "text": "Performing arithmetic operations (+, -, *, /), string concatenation, and working with input."}]
                }
            ]
        },
        {
            "n": "Part 2: Control Flow and Looping",
            "d": "Exploring conditional statements (if, elif, else) and loop structures (for loops, while loops). Learning about logical operators (and, or, not) and how to use them in control flow. Examples: building a simple calculator, implementing a guessing game, and iterating through lists.",
            "s": [
                {
                    "t": "Conditional Statements",
                    "c": [{"type": "p", "text": "Using \`if\`, \`elif\`, and \`else\` to make decisions based on conditions."}]
                },
                {
                    "t": "For Loops",
                    "c": [{"type": "p", "text": "Iterating through sequences (lists, strings, ranges) using \`for\` loops."}]
                },
                {
                    "t": "While Loops",
                    "c": [{"type": "p", "text": "Repeating code blocks as long as a condition is true using \`while\` loops."}]
                },
                {
                    "t": "Logical Operators",
                    "c": [{"type": "p", "text": "Combining conditions using \`and\`, \`or\`, and \`not\`."}]
                }
            ]
        },
        {
            "n": "Part 3: Data Structures: Lists and Dictionaries",
            "d": "In-depth look at lists and dictionaries, two fundamental Python data structures. Covering list operations (accessing elements, slicing, appending, inserting, removing), dictionary operations (adding, accessing, modifying, deleting key-value pairs), and common use cases. Examples: creating a to-do list, managing student records, and counting word frequencies.",
            "s": [
                {
                    "t": "Lists: Introduction",
                    "c": [{"type": "p", "text": "Creating lists, accessing elements, list slicing."}]
                },
                {
                    "t": "Lists: Operations",
                    "c": [{"type": "p", "text": "Appending, inserting, removing, sorting, and searching within lists."}]
                },
                {
                    "t": "Dictionaries: Introduction",
                    "c": [{"type": "p", "text": "Creating dictionaries, adding key-value pairs, accessing values."}]
                },
                {
                    "t": "Dictionaries: Operations",
                    "c": [{"type": "p", "text": "Modifying, deleting, iterating through dictionaries."}]
                }
            ]
        },
        {
            "n": "Part 4: Functions and Modules",
            "d": "Understanding functions for code reusability and modularity. Defining functions, passing arguments, returning values, and using built-in functions. Introduction to modules and importing external libraries. Examples: creating a function to calculate the area of a rectangle, writing a module for mathematical operations, and using the \`math\` module.",
            "s": [
                {
                    "t": "Defining Functions",
                    "c": [{"type": "p", "text": "Creating your own functions with parameters and return values."}]
                },
                {
                    "t": "Function Arguments",
                    "c": [{"type": "p", "text": "Passing arguments by position and keyword."}]
                },
                {
                    "t": "Built-in Functions",
                    "c": [{"type": "p", "text": "Exploring useful built-in functions like \`len()\`, \`range()\`, and \`sum()\`."}]
                },
                {
                    "t": "Modules",
                    "c": [{"type": "p", "text": "Importing and using external libraries like \`math\` and \`random\`."}]
                }
            ]
        }
    ]
}

Guidelines:
- Make each part comprehensive but concise (max 800 characters per part)
- Include practical examples and explanations
- Structure each part with clear headings and content
- Use markdown formatting within content strings
- Create 3-5 parts for a complete course

Here is the prompt: ${prompt}

Remember: Respond with ONLY \`\`\`json [your json here] \`\`\` and nothing else.`;

  return prompta;
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

    const aiPrompt = courseGen(trimmedPrompt);

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
    console.error('Error generating course:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}