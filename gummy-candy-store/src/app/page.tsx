'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { productService, initDB } from '@/lib/indexeddb'
import { seedDatabase } from '@/lib/sampleData'
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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        await initDB()
        
        // 初期データを投入（まだ商品がない場合）
        await seedDatabase()
        
        const allProducts = await productService.getAll()
        setProducts(allProducts)
      } catch (error) {
        console.error('商品の読み込みに失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' })
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヒーローセクション */}
      <section className="text-center py-12 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          グミ・あめストアへようこそ
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          美味しいグミとあめを豊富に取り揃えています
        </p>
        <button
          onClick={scrollToProducts}
          className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-pink-700 transition-colors"
        >
          商品を見る
        </button>
      </section>

      {/* 商品セクション */}
      <section id="products-section">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            おすすめ商品
          </h2>
          <Link
            href="/products"
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            すべて見る →
          </Link>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">商品がまだ登録されていません。</p>
            <p className="text-gray-500 mt-2">
              <Link href="/admin" className="text-pink-600 hover:underline">
                管理画面
              </Link>
              から商品を追加してください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* カテゴリセクション */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          カテゴリから探す
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/products?category=gummy" className="group">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-8 text-center hover:from-blue-200 hover:to-blue-300 transition-colors">
              <div className="text-6xl mb-4">🍬</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">グミ</h3>
              <p className="text-gray-600">弾力のある食感が楽しいグミ各種</p>
            </div>
          </Link>
          <Link href="/products?category=candy" className="group">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-8 text-center hover:from-orange-200 hover:to-orange-300 transition-colors">
              <div className="text-6xl mb-4">🍭</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">あめ</h3>
              <p className="text-gray-600">口の中でゆっくり溶けるあめ各種</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
