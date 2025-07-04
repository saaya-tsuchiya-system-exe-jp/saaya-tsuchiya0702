'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'

export default function CartPage() {
  const router = useRouter()
  const {
    items,
    totalItems,
    totalAmount,
    loading,
    updateCartItem,
    removeFromCart,
    clearCart
  } = useCart()
  
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      setIsUpdating(productId)
      await updateCartItem(productId, newQuantity)
    } catch (error) {
      console.error('数量の更新に失敗しました:', error)
      alert('数量の更新に失敗しました。もう一度お試しください。')
    } finally {
      setIsUpdating(null)
    }
  }

  const handleRemoveItem = async (productId: string) => {
    if (confirm('この商品をカートから削除しますか？')) {
      try {
        await removeFromCart(productId)
      } catch (error) {
        console.error('商品の削除に失敗しました:', error)
        alert('商品の削除に失敗しました。もう一度お試しください。')
      }
    }
  }

  const handleClearCart = async () => {
    if (confirm('カートをすべて空にしますか？')) {
      try {
        await clearCart()
      } catch (error) {
        console.error('カートのクリアに失敗しました:', error)
        alert('カートのクリアに失敗しました。もう一度お試しください。')
      }
    }
  }

  const handleCheckout = () => {
    // 注文確認ページに遷移
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <div className="ml-4 text-lg">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ショッピングカート</h1>
        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            カートを空にする
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            カートは空です
          </h2>
          <p className="text-gray-600 mb-8">
            商品を追加してお買い物を始めましょう
          </p>
          <Link
            href="/products"
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            商品を見る
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* カートアイテム一覧 */}
          <div className="bg-white rounded-lg shadow-sm">
            {items.map((item, index) => (
              <div key={item.productId} className={`p-6 ${index !== items.length - 1 ? 'border-b' : ''}`}>
                <div className="flex items-center space-x-4">
                  {/* 商品画像 */}
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">
                      {item.product?.name?.includes('グミ') || item.productId.includes('gummy') ? '🍬' : '🍭'}
                    </span>
                  </div>

                  {/* 商品情報 */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/products/${item.productId}`}
                      className="text-lg font-semibold text-gray-900 hover:text-pink-600"
                    >
                      {item.product?.name || 'Unknown Product'}
                    </Link>
                    <p className="text-pink-600 font-medium mt-1">
                      ¥{(item.product?.price || 0).toLocaleString()}
                    </p>
                    {item.product?.stock !== undefined && item.product.stock < 10 && (
                      <p className="text-orange-600 text-sm mt-1">
                        残り{item.product.stock}個
                      </p>
                    )}
                  </div>

                  {/* 数量調整 */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1 || isUpdating === item.productId}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium w-8 text-center">
                      {isUpdating === item.productId ? '...' : item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      disabled={
                        (item.product?.stock !== undefined && item.quantity >= item.product.stock) || 
                        isUpdating === item.productId
                      }
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>

                  {/* 小計 */}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ¥{((item.product?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  {/* 削除ボタン */}
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title="削除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 注文サマリー */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">注文サマリー</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">商品数</span>
                <span className="text-gray-900">{totalItems}個</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">小計</span>
                <span className="text-gray-900">¥{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">送料</span>
                <span className="text-gray-900">無料</span>
              </div>
              <div className="border-t pt-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">合計</span>
                  <span className="text-lg font-semibold text-pink-600">
                    ¥{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-pink-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-pink-700 transition-colors"
            >
              注文を確定する
            </button>
          </div>

          {/* 買い物を続ける */}
          <div className="text-center">
            <Link
              href="/products"
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              ← 買い物を続ける
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}