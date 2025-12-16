'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AppRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has seen welcome screen
    const welcomeSeen = localStorage.getItem('builder-gpt-welcome-seen')
    if (!welcomeSeen) {
      router.replace('/app/welcome')
    } else {
      router.replace('/app/main')
    }
  }, [router])

  // Show nothing while redirecting
  return null
}
