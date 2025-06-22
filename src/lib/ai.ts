// AI utility functions for interacting with the AI API endpoints

export interface CourseGenerationRequest {
  prompt: string;
}

export interface CourseGenerationResponse {
  response: string;
  error?: string;
}

export interface QuestionGenerationRequest {
  prompt: string;
}

export interface QuestionGenerationResponse {
  response: string;
  error?: string;
}

export interface QARequest {
  prompt: string;
}

export interface QAResponse {
  response: string;
  error?: string;
}

// Generate a course based on a prompt
export async function generateCourse(prompt: string): Promise<CourseGenerationResponse> {
  try {
    const response = await fetch('/api/ai/generate-course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { response: '', error: data.error || 'Failed to generate course' };
    }

    return data;
  } catch (error) {
    return { 
      response: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Generate questions based on course content
export async function generateQuestions(courseContent: string): Promise<QuestionGenerationResponse> {
  try {
    const response = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: courseContent }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { response: '', error: data.error || 'Failed to generate questions' };
    }

    return data;
  } catch (error) {
    return { 
      response: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Get answer to a coding question
export async function getAnswer(question: string): Promise<QAResponse> {
  try {
    const response = await fetch('/api/ai/qa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: question }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { response: '', error: data.error || 'Failed to get answer' };
    }

    return data;
  } catch (error) {
    return { 
      response: '', 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Parse JSON response from AI (handles markdown code blocks)
export function parseAIResponse(responseText: string): any {
  try {
    // If response is already JSON, parse it directly
    if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
      return JSON.parse(responseText);
    }
    
    // If response is wrapped in markdown code blocks, extract JSON
    if (responseText.includes('```json')) {
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
    }
    
    // If response is wrapped in just code blocks, extract content
    if (responseText.includes('```')) {
      const codeMatch = responseText.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        return JSON.parse(codeMatch[1]);
      }
    }
    
    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Invalid response format from AI');
  }
} 