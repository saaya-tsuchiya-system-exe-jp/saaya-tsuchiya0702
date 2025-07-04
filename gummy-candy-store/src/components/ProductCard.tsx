'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: 'gummy' | 'candy'
  imageUrl: string
  stock: number
}

interface ProductCardProps {
  product: Product
  showAddToCart?: boolean
}

export default function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart } = useCart()

  const handleAddToCart = async () => {
    if (product.stock <= 0) return
    
    try {
      setIsAdding(true)
      await addToCart(product.id, 1)
      // 成功メッセージを表示（簡単な実装）
      alert(`${product.name}をカートに追加しました！`)
    } catch (error) {
      console.error('カートへの追加に失敗しました:', error)
      alert('カートへの追加に失敗しました。もう一度お試しください。')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* 商品画像 */}
      <Link href={`/products/${product.id}`}>
        <div className="h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center cursor-pointer hover:from-pink-200 hover:to-purple-200 transition-colors">
          <div className="text-center">
            <div className="text-4xl mb-2">
              {product.category === 'gummy' ? '🍬' : '🍭'}
            </div>
            <span className="text-gray-500 text-sm">画像準備中</span>
          </div>
        </div>
      </Link>

      {/* 商品情報 */}
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-pink-600 cursor-pointer">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-pink-600">
            ¥{product.price.toLocaleString()}
          </span>
          <span className={`px-2 py-1 rounded text-xs ${
            product.category === 'gummy' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {product.category === 'gummy' ? 'グミ' : 'あめ'}
          </span>
        </div>

        {/* 在庫情報 */}
        <div className="mb-3">
          {product.stock > 0 ? (
            <span className="text-green-600 text-sm">
              在庫あり ({product.stock}個)
            </span>
          ) : (
            <span className="text-red-600 text-sm">
              在庫切れ
            </span>
          )}
        </div>

        {/* カートに追加ボタン */}
        {showAddToCart && (
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || isAdding}
            className={`w-full py-2 rounded transition-colors ${
              product.stock <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isAdding
                ? 'bg-pink-400 text-white cursor-wait'
                : 'bg-pink-600 text-white hover:bg-pink-700'
            }`}
          >
            {isAdding ? '追加中...' : product.stock <= 0 ? '在庫切れ' : 'カートに追加'}
          </button>
        )}
      </div>
    </div>
  )
}