'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { productService } from '@/lib/indexeddb'
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface ProductForm {
  name: string
  description: string
  price: number
  category: 'gummy' | 'candy'
  stock: number
  imageFile: File | null
  currentImageUrl: string
}

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

export default function AdminProductEditClient({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [productId, setProductId] = useState<string>('')
  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    category: 'gummy',
    stock: 0,
    imageFile: null,
    currentImageUrl: ''
  })

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      setInitialLoading(true)
      const productData = await productService.getById(productId)
      
      if (!productData) {
        alert('商品が見つかりませんでした。')
        router.push('/admin/products')
        return
      }

      setProduct(productData)
      setForm({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        stock: productData.stock,
        imageFile: null,
        currentImageUrl: productData.imageUrl
      })
    } catch (error) {
      console.error('商品データの読み込みに失敗しました:', error)
      alert('商品データの読み込みに失敗しました。')
      router.push('/admin/products')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? Number(value) : value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm(prev => ({ ...prev, imageFile: file }))
      
      // プレビュー用のURL作成
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.name || !form.description || form.price <= 0 || form.stock < 0) {
      alert('すべての必須項目を正しく入力してください。')
      return
    }

    if (!product) return

    try {
      setLoading(true)
      
      // 画像URLの決定
      let imageUrl = form.currentImageUrl
      if (form.imageFile) {
        // ローカル環境では仮のURLを使用
        imageUrl = `/images/${form.imageFile.name}`
      }

      const updatedProduct = {
        ...product,
        name: form.name,
        description: form.description,
        price: form.price,
        category: form.category,
        imageUrl,
        stock: form.stock,
        updatedAt: new Date()
      }

      await productService.update(updatedProduct)
      router.push('/admin/products')
    } catch (error) {
      console.error('商品の更新に失敗しました:', error)
      alert('商品の更新に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">商品が見つかりませんでした。</p>
        <Link
          href="/admin/products"
          className="mt-4 inline-block text-pink-600 hover:text-pink-800"
        >
          商品一覧に戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/products"
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品を編集</h1>
          <p className="text-gray-600">商品情報を更新してください。</p>
        </div>
      </div>

      {/* フォーム */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左側：基本情報 */}
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  商品名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  placeholder="商品名を入力してください"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  商品説明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                  placeholder="商品の説明を入力してください"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    価格 (円) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={form.price}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                    在庫数 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={form.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="gummy">グミ</option>
                  <option value="candy">あめ</option>
                </select>
              </div>
            </div>

            {/* 右側：画像アップロード */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品画像
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {imagePreview ? (
                    <div className="text-center">
                      <img
                        src={imagePreview}
                        alt="新しい画像プレビュー"
                        className="mx-auto h-32 w-32 object-cover rounded-lg mb-4"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setForm(prev => ({ ...prev, imageFile: null }))
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        新しい画像を削除
                      </button>
                    </div>
                  ) : form.currentImageUrl ? (
                    <div className="text-center">
                      <div className="mx-auto h-32 w-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                        <span className="text-sm text-gray-500">現在の画像</span>
                      </div>
                      <label htmlFor="image" className="cursor-pointer">
                        <span className="text-sm text-pink-600 hover:text-pink-800">
                          画像を変更
                        </span>
                      </label>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="image" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            画像をアップロード
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PNG, JPG, GIF (最大10MB)
                          </span>
                        </label>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  ※ 現在はローカル環境のため、実際の画像アップロードは行われません。
                </p>
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link
              href="/admin/products"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '更新中...' : '商品を更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}