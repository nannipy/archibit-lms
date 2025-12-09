import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Do not write any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Helper function to create redirect with cookies preserved
    const redirectWithCookies = (pathname: string) => {
        const url = request.nextUrl.clone()
        url.pathname = pathname
        const redirectResponse = NextResponse.redirect(url)

        // Copy all cookies from supabaseResponse to redirect response
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })

        return redirectResponse
    }

    // Protected routes - redirect to login if not authenticated
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith('/courses') ||
        request.nextUrl.pathname.startsWith('/admin')

    if (isProtectedRoute && !user) {
        return redirectWithCookies('/login')
    }

    // Admin routes - check for admin role
    if (request.nextUrl.pathname.startsWith('/admin') && user) {
        // Get user profile to check role
        const { data } = await supabase
            .from('User')
            .select('role')
            .eq('id', user.id)
            .single()

        const profile = data as { role: string } | null

        if (profile?.role !== 'ADMIN') {
            return redirectWithCookies('/courses')
        }
    }

    // Redirect authenticated users away from auth pages
    const isAuthPage =
        request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/signup'

    if (isAuthPage && user) {
        return redirectWithCookies('/courses')
    }

    return supabaseResponse
}
