'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AuthUser {
    id: string
    email: string
    name: string | null
    role: 'STUDENT' | 'ADMIN'
}

// Type for the database profile response
type UserProfile = {
    id: string
    email: string
    name: string | null
    role: string
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Get initial session
        const getSession = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser()

                if (authUser) {
                    // Fetch user profile from database
                    const { data } = await supabase
                        .from('User')
                        .select('id, email, name, role')
                        .eq('id', authUser.id)
                        .single()

                    const profile = data as UserProfile | null

                    if (profile) {
                        setUser({
                            id: profile.id,
                            email: profile.email,
                            name: profile.name,
                            role: profile.role as 'STUDENT' | 'ADMIN',
                        })
                    }
                }
            } catch (error) {
                console.error('Error fetching user:', error)
            } finally {
                setLoading(false)
            }
        }

        getSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const { data } = await supabase
                        .from('User')
                        .select('id, email, name, role')
                        .eq('id', session.user.id)
                        .single()

                    const profile = data as UserProfile | null

                    if (profile) {
                        setUser({
                            id: profile.id,
                            email: profile.email,
                            name: profile.name,
                            role: profile.role as 'STUDENT' | 'ADMIN',
                        })
                    }
                } else if (event === 'SIGNED_OUT') {
                    setUser(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase])

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        window.location.href = '/login'
    }

    return {
        user,
        loading,
        signOut,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
    }
}
