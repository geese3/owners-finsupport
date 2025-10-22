'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
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
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

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
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    } else {
      // 로그아웃 성공 시 홈으로 리디렉션
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