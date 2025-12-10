'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { QuizMarker, QuizOption } from '@/types';

interface QuizEditorProps {
    initialQuizzes: QuizMarker[];
    onChange: (quizzes: QuizMarker[]) => void;
    videoDuration: number;
}

export function QuizEditor({ initialQuizzes, onChange, videoDuration }: QuizEditorProps) {
    const [quizzes, setQuizzes] = useState<QuizMarker[]>(initialQuizzes);

    const handleAddQuiz = () => {
        const newQuiz: QuizMarker = {
            id: `temp-${Date.now()}`, // Temporary ID for new quizzes
            lessonId: '', // Will be filled by backend
            timestamp: 0, // Kept for backend compatibility, but unused in UI
            question: '',
            options: [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false }
            ]
        };
        const updated = [...quizzes, newQuiz];
        setQuizzes(updated);
        onChange(updated);
    };

    const handleRemoveQuiz = (index: number) => {
        const updated = quizzes.filter((_, i) => i !== index);
        setQuizzes(updated);
        onChange(updated);
    };

    const updateQuiz = (index: number, updates: Partial<QuizMarker>) => {
        const updated = quizzes.map((q, i) => i === index ? { ...q, ...updates } : q);
        setQuizzes(updated);
        onChange(updated);
    };

    const updateOption = (quizIndex: number, optionIndex: number, updates: Partial<QuizOption>) => {
        const updated = quizzes.map((q, i) => {
            if (i !== quizIndex) return q;
            const newOptions = q.options.map((opt, j) => j === optionIndex ? { ...opt, ...updates } : opt);
            
            // Ensure single correct answer logic if needed, currently allowing multiple check or just relying on radio logic if we strictly enforce one.
            // Requirement implies simple quiz. Let's force at least one true if user sets it.
            // For now, simple update.
            
            return { ...q, options: newOptions };
        });
        setQuizzes(updated);
        onChange(updated);
    };

    const addOption = (quizIndex: number) => {
        const updated = quizzes.map((q, i) => {
            if (i !== quizIndex) return q;
            return {
                ...q,
                options: [...q.options, { text: '', isCorrect: false }]
            };
        });
        setQuizzes(updated);
        onChange(updated);
    };
    
    const removeOption = (quizIndex: number, optionIndex: number) => {
         const updated = quizzes.map((q, i) => {
            if (i !== quizIndex) return q;
            return {
                ...q,
                options: q.options.filter((_, j) => j !== optionIndex)
            };
        });
        setQuizzes(updated);
        onChange(updated);
    };

    const handleCorrectSelect = (quizIndex: number, optionIndex: number) => {
        const updated = quizzes.map((q, i) => {
            if (i !== quizIndex) return q;
            const newOptions = q.options.map((opt, j) => ({
                ...opt,
                isCorrect: j === optionIndex // Enforce single correct answer for now
            }));
            return { ...q, options: newOptions };
        });
        setQuizzes(updated);
        onChange(updated);
    }



    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Quizzes</Label>
                <Button type="button" onClick={handleAddQuiz} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Quiz
                </Button>
            </div>

            <div className="space-y-4">
                {quizzes.length === 0 && (
                    <div className="text-center p-8 bg-muted/20 rounded-lg border border-dashed">
                        <p className="text-muted-foreground">No quizzes added. Click button to add one.</p>
                    </div>
                )}
                
                {quizzes.map((quiz, quizIndex) => (
                    <Card key={quiz.id || quizIndex} className="relative group">
                        <CardContent className="pt-6 space-y-4">
                            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveQuiz(quizIndex)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-4 space-y-2">
                                    <Label>Question</Label>
                                    <Input
                                        placeholder="Enter the question..."
                                        value={quiz.question}
                                        onChange={(e) => updateQuiz(quizIndex, { question: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pl-4 border-l-2 border-muted">
                                <Label className="text-sm font-medium">Options</Label>
                                {quiz.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={`correct-option-${quizIndex}`}
                                            checked={option.isCorrect}
                                            onChange={() => handleCorrectSelect(quizIndex, optIndex)}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <Input
                                            placeholder={`Option ${optIndex + 1}`}
                                            value={option.text}
                                            onChange={(e) => updateOption(quizIndex, optIndex, { text: e.target.value })}
                                            className="flex-1 h-9"
                                        />
                                         <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeOption(quizIndex, optIndex)}
                                            disabled={quiz.options.length <= 2}
                                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addOption(quizIndex)}
                                    className="mt-2 text-xs"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Option
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
