'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ 
  size = 'md', 
  message = '読み込み中...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center py-8'

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-pink-600 mx-auto ${sizeClasses[size]}`}></div>
        {message && (
          <p className="mt-4 text-gray-600">{message}</p>
        )}
      </div>
    </div>
  )
}

// インライン使用用の小さなスピナー
export function InlineSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-current ${className}`}></div>
  )
}