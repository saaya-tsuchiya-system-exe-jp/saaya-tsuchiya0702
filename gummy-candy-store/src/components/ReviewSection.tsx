'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { reviewService } from '@/lib/indexeddb'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}

interface ReviewSectionProps {
  productId: string
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user, isAuthenticated } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [ratingCounts, setRatingCounts] = useState<{ [key: number]: number }>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)

  useEffect(() => {
    loadReviews()
  }, [productId])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const [reviewsData, avgRating, counts] = await Promise.all([
        reviewService.getByProductId(productId),
        reviewService.getAverageRating(productId),
        reviewService.getRatingCounts(productId),
      ])

      const sortedReviews = reviewsData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setReviews(sortedReviews as Review[])
      setAverageRating(avgRating)
      setRatingCounts(counts)

      // ユーザーの既存レビューをチェック
      if (user) {
        const existingReview = sortedReviews.find(review => review.userId === user.id)
        setUserReview(existingReview as Review || null)
      }
    } catch (error) {
      console.error('レビューの取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !isAuthenticated) {
      alert('レビューを投稿するにはログインが必要です。')
      return
    }

    if (!newReview.comment.trim()) {
      alert('コメントを入力してください。')
      return
    }

    setSubmitting(true)

    try {
      const reviewData = {
        id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId,
        userId: user.id,
        userName: user.name,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      if (userReview) {
        // 既存レビューの更新
        await reviewService.update({
          ...reviewData,
          id: userReview.id,
        })
      } else {
        // 新規レビューの追加
        await reviewService.add(reviewData)
      }

      setNewReview({ rating: 5, comment: '' })
      setShowReviewForm(false)
      await loadReviews()
    } catch (error) {
      console.error('レビューの投稿に失敗しました:', error)
      alert('レビューの投稿に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async () => {
    if (!userReview || !confirm('レビューを削除しますか？')) return

    try {
      await reviewService.delete(userReview.id)
      await loadReviews()
    } catch (error) {
      console.error('レビューの削除に失敗しました:', error)
      alert('レビューの削除に失敗しました。')
    }
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
            className={interactive ? 'hover:scale-110 transition-transform' : ''}
            disabled={!interactive}
          >
            {star <= rating ? (
              <StarIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarOutlineIcon className="h-5 w-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    )
  }

  const totalReviews = reviews.length

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">レビュー・評価</h2>

      {/* 評価サマリー */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="text-4xl font-bold mr-4">{averageRating.toFixed(1)}</div>
          <div>
            {renderStars(Math.round(averageRating))}
            <p className="text-sm text-gray-600 mt-1">{totalReviews}件のレビュー</p>
          </div>
        </div>

        {/* 評価分布 */}
        {totalReviews > 0 && (
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: totalReviews > 0 ? `${(ratingCounts[rating] / totalReviews) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8">{ratingCounts[rating]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* レビュー投稿フォーム */}
      {isAuthenticated ? (
        <div className="mb-8">
          {userReview ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">あなたのレビュー</h3>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      setNewReview({
                        rating: userReview.rating,
                        comment: userReview.comment,
                      })
                      setShowReviewForm(true)
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    編集
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    削除
                  </button>
                </div>
              </div>
              {renderStars(userReview.rating)}
              <p className="mt-2 text-gray-700">{userReview.comment}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(userReview.createdAt).toLocaleDateString('ja-JP')}
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
            >
              レビューを書く
            </button>
          )}

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mt-4 bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-4">
                {userReview ? 'レビューを編集' : 'レビューを投稿'}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">評価</label>
                {renderStars(newReview.rating, true, (rating) => 
                  setNewReview(prev => ({ ...prev, rating }))
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  コメント <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="商品の感想をお聞かせください..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? '投稿中...' : userReview ? '更新' : '投稿'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false)
                    setNewReview({ rating: 5, comment: '' })
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="mb-8 bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600">レビューを投稿するには<a href="/login" className="text-pink-600 hover:text-pink-700">ログイン</a>が必要です。</p>
        </div>
      )}

      {/* レビュー一覧 */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">
          レビュー一覧 ({totalReviews}件)
        </h3>

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">まだレビューがありません。最初のレビューを投稿してみませんか？</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{review.userName}</h4>
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}