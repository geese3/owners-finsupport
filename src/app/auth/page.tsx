'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    // /auth로 직접 접근한 경우 로그인 페이지로 리디렉션
    console.log('📍 Redirecting /auth to /auth/login')
    router.replace('/auth/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
        <p className="mt-4 text-gray-600">로그인 페이지로 이동 중...</p>
      </div>
    </div>
  )
}