import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { QuizOption } from '@/types';

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { quizMarkerId, selectedOption } = body;

        // Fetch quiz marker
        const quizMarker = await prisma.quizMarker.findUnique({
            where: { id: quizMarkerId },
            include: {
                lesson: true,
            },
        });

        if (!quizMarker) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        // Parse options from JSON
        const options = quizMarker.options as QuizOption[];

        if (selectedOption < 0 || selectedOption >= options.length) {
            return NextResponse.json({ error: 'Invalid option index' }, { status: 400 });
        }

        const selectedAnswer = options[selectedOption];
        const isCorrect = selectedAnswer.isCorrect;

        // Save attempt to database
        await prisma.quizAttempt.create({
            data: {
                userId: user.id,
                quizMarkerId,
                selectedOption,
                isCorrect,
            },
        });

        // If incorrect, calculate rewind time (30 seconds before quiz marker)
        const rewindTo = isCorrect ? undefined : Math.max(0, quizMarker.timestamp - 30);

        return NextResponse.json({
            isCorrect,
            rewindTo,
        });
    } catch (error) {
        console.error('Quiz submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
