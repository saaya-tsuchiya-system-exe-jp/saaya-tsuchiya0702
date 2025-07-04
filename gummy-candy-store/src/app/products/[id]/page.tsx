'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { productService, initDB } from '@/lib/indexeddb'
import { useCart } from '@/contexts/CartContext'
import ReviewSection from '@/components/ReviewSection'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: 'gummy' | 'candy'
  imageUrl: string
  stock: number
  createdAt: Date
  updatedAt: Date
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        await initDB()
        const productData = await productService.getById(params.id as string)
        
        if (!productData) {
          router.push('/products')
          return
        }
        
        setProduct(productData)
      } catch (error) {
        console.error('商品の読み込みに失敗しました:', error)
        router.push('/products')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadProduct()
    }
  }, [params.id, router])

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return
    
    try {
      setIsAdding(true)
      await addToCart(product.id, quantity)
      alert(`${product.name} を ${quantity}個 カートに追加しました！`)
    } catch (error) {
      console.error('カートへの追加に失敗しました:', error)
      alert('カートへの追加に失敗しました。もう一度お試しください。')
    } finally {
      setIsAdding(false)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <div className="ml-4 text-lg">読み込み中...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">商品が見つかりませんでした。</p>
          <Link href="/products" className="text-pink-600 hover:underline mt-4 inline-block">
            商品一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* パンくずリスト */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-pink-600">ホーム</Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/products" className="hover:text-pink-600">商品一覧</Link>
          </li>
          <li>/</li>
          <li className="text-gray-900">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* 商品画像 */}
        <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-8xl mb-4">
              {product.category === 'gummy' ? '🍬' : '🍭'}
            </div>
            <span className="text-gray-500">画像準備中</span>
          </div>
        </div>

        {/* 商品情報 */}
        <div className="space-y-6">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
              product.category === 'gummy' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {product.category === 'gummy' ? 'グミ' : 'あめ'}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <p className="text-4xl font-bold text-pink-600 mb-6">
              ¥{product.price.toLocaleString()}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">商品説明</h2>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">在庫状況</h2>
            {product.stock > 0 ? (
              <p className="text-green-600">
                在庫あり ({product.stock}個)
              </p>
            ) : (
              <p className="text-red-600">在庫切れ</p>
            )}
          </div>

          {/* 数量選択とカートに追加 */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数量
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`w-full py-3 px-6 rounded-lg text-lg font-medium transition-colors ${
                  isAdding
                    ? 'bg-pink-400 text-white cursor-wait'
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
              >
                {isAdding ? 'カートに追加中...' : 'カートに追加'}
              </button>
            </div>
          )}

          {/* 商品情報 */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">商品情報</h2>
            <dl className="space-y-2">
              <div className="flex">
                <dt className="text-sm text-gray-500 w-20">商品ID:</dt>
                <dd className="text-sm text-gray-900">{product.id}</dd>
              </div>
              <div className="flex">
                <dt className="text-sm text-gray-500 w-20">カテゴリ:</dt>
                <dd className="text-sm text-gray-900">
                  {product.category === 'gummy' ? 'グミ' : 'あめ'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* レビューセクション */}
      <div className="mt-12">
        <ReviewSection productId={product.id} />
      </div>

      {/* 戻るボタン */}
      <div className="mt-12">
        <Link
          href="/products"
          className="inline-flex items-center text-pink-600 hover:text-pink-700"
        >
          ← 商品一覧に戻る
        </Link>
      </div>
    </div>
  )
}