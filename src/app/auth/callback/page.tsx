'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=callback_error')
          return
        }

        if (data.session) {
          console.log('✅ Email confirmation successful, user logged in')
          // 이메일 확인 완료 후 대시보드로 리디렉션
          router.push('/dashboard')
        } else {
          console.log('No session found, redirecting to login')
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err)
        router.push('/auth/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            이메일 확인 중...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            잠시만 기다려주세요. 계정을 확인하고 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}