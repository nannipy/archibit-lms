'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuizMarker } from '@/types';

interface QuizModalProps {
    marker: QuizMarker;
    onComplete: (isCorrect: boolean, rewindTo?: number) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export default function QuizModal({ marker, onComplete, isOpen = true, onClose }: QuizModalProps) {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

    const handleSubmit = async () => {
        if (selectedOption === null) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizMarkerId: marker.id,
                    selectedOption,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit quiz');
            }

            setFeedback({
                isCorrect: data.isCorrect,
                message: data.isCorrect
                    ? 'Ottimo! Risposta corretta!'
                    : 'Risposta sbagliata. Rivedi il video e riprova.',
            });

            // Auto-close after showing feedback
            setTimeout(() => {
                onComplete(data.isCorrect, data.rewindTo);
            }, 2000);
        } catch (error) {
            console.error('Quiz submission error:', error);
            setFeedback({
                isCorrect: false,
                message: 'Errore durante l\'invio. Riprova.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-xl bg-gray-900 border-gray-700 text-white">
                <CardHeader>
                    <CardTitle className="text-xl">Quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Question */}
                    <p className="text-lg font-medium">{marker.question}</p>

                    {/* Options */}
                    <div className="space-y-3">
                        {marker.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => !feedback && setSelectedOption(index)}
                                disabled={!!feedback || isSubmitting}
                                className={`w-full text-left p-4 rounded-lg border transition-all ${
                                    selectedOption === index
                                        ? 'border-blue-500 bg-blue-500/20'
                                        : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
                                } ${
                                    feedback && option.isCorrect
                                        ? 'border-green-500 bg-green-500/20'
                                        : feedback && selectedOption === index && !option.isCorrect
                                        ? 'border-red-500 bg-red-500/20'
                                        : ''
                                } disabled:cursor-not-allowed`}
                            >
                                <span className="inline-flex items-center justify-center w-6 h-6 mr-3 rounded-full bg-gray-700 text-sm">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                {option.text}
                            </button>
                        ))}
                    </div>

                    {/* Feedback */}
                    {feedback && (
                        <div
                            className={`p-4 rounded-lg ${
                                feedback.isCorrect
                                    ? 'bg-green-500/20 border border-green-500 text-green-300'
                                    : 'bg-red-500/20 border border-red-500 text-red-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                {feedback.isCorrect ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                                {feedback.message}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    {!feedback && (
                        <Button
                            onClick={handleSubmit}
                            disabled={selectedOption === null || isSubmitting}
                            className="w-full"
                        >
                            {isSubmitting ? 'Invio in corso...' : 'Conferma risposta'}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
