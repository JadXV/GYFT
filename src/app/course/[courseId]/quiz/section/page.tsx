"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, RefreshCw, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Question {
  q: string;
  a1: string;
  a2: string;
  a3: string;
  a4: string;
  correct: "a1" | "a2" | "a3" | "a4";
  part: number;
}

interface ContentBlock {
  type: 'p' | 'code';
  text?: string;
  lang?: string;
  code?: string;
}

interface Section {
  t: string; // title
  c: ContentBlock[]; // content
}

interface Chapter {
  n: string; // name
  d: string; // description
  s: Section[]; // sections
}

interface Course {
  _id: string;
  title: string;
  description: string;
  language: string;
  chapters: Chapter[];
  topic: string;
  created_at: string;
  user_id: string;
}

export default function SectionQuiz() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const sectionTitle = searchParams.get('section');

  const [course, setCourse] = useState<Course | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && courseId) {
      fetchCourse();
    }
  }, [status, router, courseId]);

  const fetchCourse = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
        
        // Find the specific section
        const allSections = data.chapters.flatMap((chapter: Chapter) => chapter.s);
        const targetSection = allSections.find((section: Section) => section.t === sectionTitle);
        
        if (targetSection) {
          setCurrentSection(targetSection);
          await generateQuestionsForSection(targetSection);
        } else {
          setError('Section not found');
        }
      } else {
        setError('Failed to load course');
      }
    } catch (error) {
      setError('Error loading course');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestionsForSection = async (section: Section) => {
    setIsGenerating(true);
    try {
      const sectionContent = section.c.map(block => {
        if (block.type === 'p') return block.text;
        if (block.type === 'code') return `\`\`\`${block.lang || ''}\n${block.code}\n\`\`\``;
        return '';
      }).join('\n');
      
      const prompt = `Section: ${section.t}\n${sectionContent}`;

      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt
        }),
      });

      if (response.ok) {
        const data = await response.json();
        try {
          const parsedQuestions = JSON.parse(data.response);
          const validQuestions = parsedQuestions.slice(0, 3).map((q: any, index: number) => ({
            q: q.q || q.question || 'Question not available',
            a1: q.a1 || q.options?.[0] || 'Option 1',
            a2: q.a2 || q.options?.[1] || 'Option 2', 
            a3: q.a3 || q.options?.[2] || 'Option 3',
            a4: q.a4 || q.options?.[3] || 'Option 4',
            correct: q.correct || 'a1',
            part: index
          }));
          setQuestions(validQuestions);
        } catch (parseError) {
          console.error('Error parsing questions:', parseError);
          setError('Failed to generate valid questions');
        }
      } else {
        setError('Failed to generate questions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setError('Error generating questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (selectedOption: number) => {
    if (showAnswer) return;
    
    setSelectedAnswer(selectedOption);
    setShowAnswer(true);
    
    const currentQ = questions[currentQuestion];
    const correctAnswerIndex = currentQ.correct === 'a1' ? 0 : 
                              currentQ.correct === 'a2' ? 1 :
                              currentQ.correct === 'a3' ? 2 : 3;
    
    if (selectedOption === correctAnswerIndex) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  const getButtonColor = (index: number) => {
    const colors = [
      { border: "border-red-500", hover: "hover:bg-red-500", bg: "bg-red-500" },
      { border: "border-green-500", hover: "hover:bg-green-500", bg: "bg-green-500" },
      { border: "border-yellow-500", hover: "hover:bg-yellow-500", bg: "bg-yellow-500" },
      { border: "border-blue-500", hover: "hover:bg-blue-500", bg: "bg-blue-500" }
    ];
    return colors[index] || colors[0];
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading section...</p>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-xl">Generating questions for section...</p>
          <p className="text-gray-400 mt-2">"{sectionTitle}"</p>
        </div>
      </div>
    );
  }

  if (error || !course || !currentSection || questions.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error || 'Section not found or no questions available'}</p>
          <Button 
            onClick={() => router.push(`/course/${courseId}`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const options = [currentQ.a1, currentQ.a2, currentQ.a3, currentQ.a4];
  const correctAnswerIndex = currentQ.correct === 'a1' ? 0 : 
                            currentQ.correct === 'a2' ? 1 :
                            currentQ.correct === 'a3' ? 2 : 3;

  const isQuizComplete = currentQuestion === questions.length - 1 && showAnswer;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold">{currentSection.t}</h1>
          </div>
          <p className="text-gray-400 mb-4">Quiz for this section</p>
          
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>Score: {score}/{questions.length}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-12">
          <h2 className="text-xl font-bold mb-8 leading-relaxed">
            {currentQ.q}
          </h2>
        </div>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {options.map((option, index) => {
            const colors = getButtonColor(index);
            const isSelected = selectedAnswer === index;
            const isCorrect = index === correctAnswerIndex;
            
            let buttonClasses = `h-20 md:h-24 rounded-lg border-2 text-white font-bold text-base md:text-lg transition-all duration-300 hover:shadow-xl ${colors.border} bg-slate-800/50 backdrop-blur-sm`;
            
            if (!showAnswer) {
              buttonClasses += ` ${colors.hover} hover:bg-opacity-20 hover:shadow-lg`;
            } else {
              if (isCorrect) {
                buttonClasses += ` ${colors.bg} bg-opacity-70 shadow-lg border-opacity-100`;
              } else if (isSelected && !isCorrect) {
                buttonClasses += ` bg-red-600 bg-opacity-70 border-red-500 shadow-lg`;
              } else {
                buttonClasses += ` bg-slate-700 bg-opacity-50 border-slate-600`;
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showAnswer}
                className={buttonClasses}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {!showAnswer && (
            <Button 
              onClick={() => handleAnswer(-1)}
              variant="ghost"
              className="px-6 py-3"
            >
              I don't know
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            variant="secondary"
            className="flex items-center gap-2 px-6 py-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {isQuizComplete && (
            <div className="text-center">
              <p className="text-xl font-bold mb-4">
                Section Quiz Complete! Score: {score}/{questions.length}
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={restartQuiz}
                  variant="primary"
                  className="px-6 py-3"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart
                </Button>
                <Button
                  onClick={() => router.push(`/course/${courseId}/quiz`)}
                  variant="primary"
                  className="px-6 py-3"
                >
                  Full Course Quiz
                </Button>
                <Button
                  onClick={() => router.push(`/course/${courseId}`)}
                  variant="default"
                  className="px-6 py-3"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Course
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={nextQuestion}
            disabled={!showAnswer || currentQuestion === questions.length - 1}
            variant="primary"
            className="flex items-center gap-2 px-6 py-3"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
