"use client";
import { Button } from "@/components/ui/button";
import { CircleQuestionMark } from "lucide-react";
import { useState } from "react";

export default function Quiz() {
  const [currentQuestion, _] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const quizData = [
    {
      question: "HOW TO BE fgbb?",
      options: ["LAY", "LAY", "LAY", "LAY"],
      correctAnswer: 0,
    },
  ];

  const handleAnswer = (selectedOption: number) => {
    setShowAnswer(true);
    if (selectedOption === quizData[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    setTimeout(() => {
      setShowAnswer(false);
      //   setCurrentQuestion(currentQuestion + 1 );
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-8 tracking-wide">
            {quizData[currentQuestion].question}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-12">
          {quizData[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showAnswer}
              className={`h-32 rounded-lg border-2 text-white font-bold text-2xl transition-all hover:opacity-80
                ${
                  index === 0
                    ? "border-red-500"
                    : index === 1
                      ? "border-green-500"
                      : index === 2
                        ? "border-yellow-500"
                        : "border-blue-500"
                } bg-transparent hover:bg-opacity-10
                ${index === 0 ? "hover:bg-red-500" : ""}
                ${index === 1 ? "hover:bg-green-500" : ""}
                ${index === 2 ? "hover:bg-yellow-500" : ""}
                ${index === 3 ? "hover:bg-blue-500" : ""}
              `}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-6">
          <Button className="px-8 py-3 border border-gray-500 rounded text-gray-300 hover:bg-gray-800 transition-all">
            I don't know
          </Button>
          <Button className="px-8 py-3 border border-gray-500 rounded text-gray-300 hover:bg-gray-800 transition-all">
            <CircleQuestionMark /> Gyft Explain
          </Button>
        </div>
      </div>
    </div>
  );
}
