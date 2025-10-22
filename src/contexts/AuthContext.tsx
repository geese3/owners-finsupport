'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 현재 세션 가져오기
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', { event, hasSession: !!session })
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // 로그아웃 이벤트 처리
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out, clearing local state')
          setUser(null)
          setSession(null)
        }

        // 사용자 프로필 정보도 함께 생성
        if (event === 'SIGNED_IN' && session?.user) {
          // 먼저 users 테이블에 삽입
          const { error: userError } = await supabase
            .from('users')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
            })

          if (userError) {
            console.error('Error creating user:', userError)
            return
          }

          // 그 다음 user_profiles 테이블에 삽입
          const { error } = await supabase
            .from('user_profiles')
            .upsert({
              id: session.user.id,
              company_name: session.user.user_metadata?.company || null,
              business_number: session.user.user_metadata?.businessNumber || null,
              business_type: session.user.user_metadata?.businessType || '개인사업자',
              company_size: session.user.user_metadata?.companySize || null,
              corporate_number: session.user.user_metadata?.corporateNumber || null,
              industry: session.user.user_metadata?.industry || null,
              region: session.user.user_metadata?.region || null,
              phone: session.user.user_metadata?.phone || null,
              plan_type: session.user.user_metadata?.planType || 'FREE',
            })

          if (error) {
            console.error('Error creating user profile:', error)
            console.error('Error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            })
          } else {
            console.log('User profile created successfully')
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    console.log('🔓 Sign out process started')

    try {
      // 타임아웃 설정 (5초)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Logout timeout')), 5000)
      )

      const signOutPromise = supabase.auth.signOut()

      const result = await Promise.race([signOutPromise, timeoutPromise])
      const { error } = result as any

      console.log('🔓 Supabase signOut result:', { error })

      if (error) {
        console.error('❌ Error signing out:', error)
        console.error('Error details:', {
          message: error.message,
          ...(error as any).details && { details: (error as any).details },
          ...(error as any).hint && { hint: (error as any).hint },
          ...(error as any).code && { code: (error as any).code }
        })
        // 에러가 있어도 강제 로그아웃 진행
        console.log('⚠️ Forcing logout despite error')
        await forceLogout()
      } else {
        console.log('✅ Sign out successful, redirecting to home')
        await performRedirect()
      }
    } catch (err) {
      console.error('💥 Unexpected error during sign out:', err)
      if ((err as Error).message === 'Logout timeout') {
        console.log('⏰ Logout timed out, forcing logout')
        await forceLogout()
      } else {
        // 다른 에러의 경우에도 강제 로그아웃
        console.log('⚠️ Forcing logout due to error')
        await forceLogout()
      }
    }
  }

  const forceLogout = async () => {
    console.log('🔄 Force logout: Clearing local state')
    // 로컬 상태 강제 초기화
    setUser(null)
    setSession(null)

    // 로컬 스토리지 정리
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('supabase.auth.token')
        localStorage.clear() // 모든 로컬 스토리지 정리
        sessionStorage.clear() // 세션 스토리지도 정리
        console.log('🧹 Local storage cleared')
      } catch (storageError) {
        console.warn('⚠️ Failed to clear storage:', storageError)
      }
    }

    await performRedirect()
  }

  const performRedirect = async () => {
    console.log('🔄 Performing redirect to home')
    try {
      console.log('🔄 Using Next.js router to redirect to home')
      router.push('/')
      router.refresh() // 페이지 새로고침으로 상태 완전 초기화
    } catch (routerError) {
      console.warn('⚠️ Router failed, falling back to window.location')
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}