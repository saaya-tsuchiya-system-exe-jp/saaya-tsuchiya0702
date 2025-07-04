'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { productService, initDB } from '@/lib/indexeddb'
import ProductCard from '@/components/ProductCard'

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

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'gummy' | 'candy'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name')
  
  const searchParams = useSearchParams()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        await initDB()
        const allProducts = await productService.getAll()
        setProducts(allProducts)
        
        // URLパラメータからカテゴリを取得
        const categoryParam = searchParams.get('category')
        if (categoryParam === 'gummy' || categoryParam === 'candy') {
          setSelectedCategory(categoryParam)
        }
      } catch (error) {
        console.error('商品の読み込みに失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [searchParams])

  useEffect(() => {
    let filtered = [...products]

    // カテゴリフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // ソート
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, sortBy])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <div className="ml-4 text-lg">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">商品一覧</h1>
        <p className="text-gray-600">
          {filteredProducts.length}件の商品が見つかりました
        </p>
      </div>

      {/* フィルターとソート */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* カテゴリフィルター */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">カテゴリ:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setSelectedCategory('gummy')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'gummy'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🍬 グミ
              </button>
              <button
                onClick={() => setSelectedCategory('candy')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'candy'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🍭 あめ
              </button>
            </div>
          </div>

          {/* ソート */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">並び順:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price-low' | 'price-high')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="name">名前順</option>
              <option value="price-low">価格の安い順</option>
              <option value="price-high">価格の高い順</option>
            </select>
          </div>
        </div>
      </div>

      {/* 商品グリッド */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg">該当する商品が見つかりませんでした。</p>
          <p className="text-gray-500 mt-2">
            フィルターを変更して再度お試しください。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <div className="ml-4 text-lg">読み込み中...</div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}