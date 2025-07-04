'use client'

import { useEffect, useState } from 'react'
import { seedDatabase } from '@/lib/sampleData'

export default function InitializeData() {
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        const wasSeeded = await seedDatabase()
        setInitialized(true)
        
        if (wasSeeded) {
          console.log('サンプルデータが初期化されました')
        }
      } catch (error) {
        console.error('データ初期化エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [])

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg">
        データを初期化中...
      </div>
    )
  }

  if (initialized) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg">
        データ初期化完了
      </div>
    )
  }

  return null
}