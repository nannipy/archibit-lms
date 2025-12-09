import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, email, name } = body;

        if (!userId || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' });
        }

        // Create user profile
        const user = await prisma.user.create({
            data: {
                id: userId,
                email: email,
                name: name || null,
                password: '', // Supabase Auth handles password
                role: 'STUDENT',
            },
        });

        return NextResponse.json({ message: 'Profile created', userId: user.id });
    } catch (error) {
        console.error('Error creating user profile:', error);
        return NextResponse.json(
            { error: 'Failed to create user profile' },
            { status: 500 }
        );
    }
}
