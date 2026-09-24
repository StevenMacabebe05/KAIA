import { useEffect, useState } from 'react'
import { activityStore } from './activityStore'

export function useActivity() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const handler = () => setTick((n) => n + 1)
    window.addEventListener('kaia-store-change', handler)
    return () => window.removeEventListener('kaia-store-change', handler)
  }, [])

  return activityStore
}