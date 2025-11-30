'use client';

import { useState } from 'react';
import { QuizMarker, QuizSubmitResponse } from '@/types';

interface QuizModalProps {
  marker: QuizMarker;
  onComplete: (isCorrect: boolean, rewindTo?: number) => void;
}

export default function QuizModal({ marker, onComplete }: QuizModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const handleSubmit = async () => {
    if (selectedOption === null) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizMarkerId: marker.id,
          selectedOption,
        }),
      });

      if (!response.ok) {
        throw new Error('Quiz submission failed');
      }

      const data: QuizSubmitResponse = await response.json();
      
      setFeedback(data.isCorrect ? 'correct' : 'incorrect');

      // Show feedback for 2 seconds then close
      setTimeout(() => {
        onComplete(data.isCorrect, data.rewindTo);
      }, 2000);
    } catch (error) {
      console.error('Quiz submission error:', error);
      alert('Failed to submit quiz. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8">
        {feedback === null ? (
          <>
            {/* Quiz Question */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-3 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Quiz Question
                </h2>
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {marker.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {marker.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedOption === index
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === index
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-400'
                      }`}
                    >
                      {selectedOption === index && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {option.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null || isSubmitting}
              className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
                selectedOption === null || isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </button>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
              The video will resume after you answer this question
            </p>
          </>
        ) : (
          /* Feedback */
          <div className="text-center py-8">
            {feedback === 'correct' ? (
              <>
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-green-600 mb-2">Correct!</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Great job! The video will continue in a moment.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-red-600 mb-2">Incorrect</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  The video will rewind. Please watch again and try again.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
