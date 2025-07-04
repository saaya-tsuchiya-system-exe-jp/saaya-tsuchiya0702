'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { productService } from '@/lib/indexeddb'
import ProductCard from '@/components/ProductCard'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

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

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'gummy' | 'candy'>('all')
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('name')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await productService.getAll()
        setProducts(allProducts as Product[])
      } catch (error) {
        console.error('商品の取得に失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    let filtered = [...products]

    // テキスト検索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      )
    }

    // カテゴリフィルター
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // 価格帯フィルター
    if (priceRange !== 'all') {
      switch (priceRange) {
        case 'low':
          filtered = filtered.filter(product => product.price < 200)
          break
        case 'medium':
          filtered = filtered.filter(product => product.price >= 200 && product.price < 300)
          break
        case 'high':
          filtered = filtered.filter(product => product.price >= 300)
          break
      }
    }

    // ソート
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, priceRange, sortBy])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // 検索は自動的に実行されるため、特別な処理は不要
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setPriceRange('all')
    setSortBy('name')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">商品を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">商品検索</h1>

      {/* 検索フォーム */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="商品名や説明で検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
            <button
              type="submit"
              className="bg-pink-600 text-white px-6 py-2 rounded-r-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              検索
            </button>
          </div>
        </form>

        {/* フィルター切り替えボタン */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          フィルター {showFilters ? '非表示' : '表示'}
        </button>

        {/* フィルター */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as 'all' | 'gummy' | 'candy')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">すべて</option>
                  <option value="gummy">グミ</option>
                  <option value="candy">あめ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">価格帯</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as 'all' | 'low' | 'medium' | 'high')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="all">すべて</option>
                  <option value="low">200円未満</option>
                  <option value="medium">200円〜300円未満</option>
                  <option value="high">300円以上</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">並び順</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price-low' | 'price-high' | 'newest')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="name">名前順</option>
                  <option value="price-low">価格の安い順</option>
                  <option value="price-high">価格の高い順</option>
                  <option value="newest">新着順</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  フィルターをクリア
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 検索結果 */}
      <div className="mb-4">
        <p className="text-gray-600">
          {searchQuery && `「${searchQuery}」の検索結果: `}
          {filteredProducts.length}件の商品が見つかりました
        </p>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MagnifyingGlassIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">商品が見つかりませんでした</h2>
          <p className="text-gray-500 mb-6">
            検索条件を変更して再度お試しください。
          </p>
          <button
            onClick={clearFilters}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
          >
            すべての商品を表示
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}