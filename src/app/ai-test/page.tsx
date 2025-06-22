'use client';

import { useState } from 'react';
import { generateCourse, generateQuestions, getAnswer, parseAIResponse } from '@/lib/ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AITestPage() {
  const [coursePrompt, setCoursePrompt] = useState('');
  const [courseResult, setCourseResult] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [questionResult, setQuestionResult] = useState('');
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaResult, setQaResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateCourse = async () => {
    if (!coursePrompt.trim()) return;
    
    setLoading(true);
    try {
      const result = await generateCourse(coursePrompt);
      if (result.error) {
        setCourseResult(`Error: ${result.error}`);
      } else {
        try {
          const parsed = parseAIResponse(result.response);
          setCourseResult(JSON.stringify(parsed, null, 2));
        } catch (e) {
          setCourseResult(`Raw response: ${result.response}`);
        }
      }
    } catch (error) {
      setCourseResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!questionContent.trim()) return;
    
    setLoading(true);
    try {
      const result = await generateQuestions(questionContent);
      if (result.error) {
        setQuestionResult(`Error: ${result.error}`);
      } else {
        try {
          const parsed = parseAIResponse(result.response);
          setQuestionResult(JSON.stringify(parsed, null, 2));
        } catch (e) {
          setQuestionResult(`Raw response: ${result.response}`);
        }
      }
    } catch (error) {
      setQuestionResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQA = async () => {
    if (!qaQuestion.trim()) return;
    
    setLoading(true);
    try {
      const result = await getAnswer(qaQuestion);
      if (result.error) {
        setQaResult(`Error: ${result.error}`);
      } else {
        try {
          const parsed = parseAIResponse(result.response);
          setQaResult(JSON.stringify(parsed, null, 2));
        } catch (e) {
          setQaResult(`Raw response: ${result.response}`);
        }
      }
    } catch (error) {
      setQaResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">AI Functionality Test</h1>
      
      {/* Course Generation */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Course Generation</h2>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter course topic (e.g., 'JavaScript for beginners')"
            value={coursePrompt}
            onChange={(e) => setCoursePrompt(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleGenerateCourse} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Course'}
          </Button>
        </div>
        {courseResult && (
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {courseResult}
          </pre>
        )}
      </div>

      {/* Question Generation */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Question Generation</h2>
        <div className="mb-4">
          <textarea
            placeholder="Paste course content here to generate questions..."
            value={questionContent}
            onChange={(e) => setQuestionContent(e.target.value)}
            className="w-full h-32 p-2 border rounded resize-none"
          />
        </div>
        <Button onClick={handleGenerateQuestions} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Questions'}
        </Button>
        {questionResult && (
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 mt-4">
            {questionResult}
          </pre>
        )}
      </div>

      {/* Q&A */}
      <div className="mb-8 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Q&A</h2>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Ask a coding question..."
            value={qaQuestion}
            onChange={(e) => setQaQuestion(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleQA} disabled={loading}>
            {loading ? 'Getting Answer...' : 'Get Answer'}
          </Button>
        </div>
        {qaResult && (
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {qaResult}
          </pre>
        )}
      </div>
    </div>
  );
} 