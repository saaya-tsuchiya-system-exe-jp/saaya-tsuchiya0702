'use client'

import { useEffect, useState } from 'react'
import { productService } from '@/lib/indexeddb'
import { 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

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

interface InventoryItem extends Product {
  isEditing: boolean
  newStock: number
}

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'gummy' | 'candy'>('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      setLoading(true)
      const products = await productService.getAll()
      const inventoryItems = products.map(product => ({
        ...product,
        isEditing: false,
        newStock: product.stock
      }))
      setInventory(inventoryItems)
    } catch (error) {
      console.error('在庫データの読み込みに失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditStart = (productId: string) => {
    setInventory(inventory.map(item => 
      item.id === productId 
        ? { ...item, isEditing: true, newStock: item.stock }
        : item
    ))
  }

  const handleEditCancel = (productId: string) => {
    setInventory(inventory.map(item => 
      item.id === productId 
        ? { ...item, isEditing: false, newStock: item.stock }
        : item
    ))
  }

  const handleStockChange = (productId: string, newStock: number) => {
    setInventory(inventory.map(item => 
      item.id === productId 
        ? { ...item, newStock: Math.max(0, newStock) }
        : item
    ))
  }

  const handleStockUpdate = async (productId: string) => {
    const item = inventory.find(i => i.id === productId)
    if (!item) return

    try {
      const updatedProduct = {
        ...item,
        stock: item.newStock,
        updatedAt: new Date()
      }

      await productService.update(updatedProduct)
      
      setInventory(inventory.map(i => 
        i.id === productId 
          ? { ...i, stock: item.newStock, isEditing: false, updatedAt: new Date() }
          : i
      ))
    } catch (error) {
      console.error('在庫の更新に失敗しました:', error)
      alert('在庫の更新に失敗しました。')
    }
  }

  const handleBulkStockUpdate = async (adjustment: number) => {
    if (!confirm(`すべての商品の在庫を${adjustment > 0 ? '+' : ''}${adjustment}個調整しますか？`)) {
      return
    }

    try {
      const updates = inventory.map(async (item) => {
        const newStock = Math.max(0, item.stock + adjustment)
        const updatedProduct = {
          ...item,
          stock: newStock,
          updatedAt: new Date()
        }
        await productService.update(updatedProduct)
        return { ...item, stock: newStock, updatedAt: new Date() }
      })

      const updatedItems = await Promise.all(updates)
      setInventory(updatedItems.map(item => ({ ...item, isEditing: false, newStock: item.stock })))
    } catch (error) {
      console.error('一括在庫更新に失敗しました:', error)
      alert('一括在庫更新に失敗しました。')
    }
  }

  // フィルタリング
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && item.stock > 0 && item.stock < 20) ||
                        (stockFilter === 'out' && item.stock === 0)
    return matchesSearch && matchesCategory && matchesStock
  })

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: '在庫切れ', class: 'text-red-600 bg-red-100' }
    if (stock < 10) return { text: '在庫少', class: 'text-red-600 bg-red-100' }
    if (stock < 20) return { text: '在庫注意', class: 'text-yellow-600 bg-yellow-100' }
    return { text: '在庫十分', class: 'text-green-600 bg-green-100' }
  }

  const lowStockCount = inventory.filter(item => item.stock < 10).length
  const outOfStockCount = inventory.filter(item => item.stock === 0).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">在庫管理</h1>
        <p className="text-gray-600">商品の在庫状況を確認・更新します。</p>
      </div>

      {/* 在庫アラート */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">在庫アラート</p>
              <p>
                {outOfStockCount > 0 && `在庫切れ: ${outOfStockCount}商品`}
                {outOfStockCount > 0 && lowStockCount > 0 && ' | '}
                {lowStockCount > 0 && `在庫少: ${lowStockCount}商品`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900">{inventory.length}</p>
            <p className="text-sm text-gray-500">総商品数</p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-green-600">
              {inventory.filter(item => item.stock >= 20).length}
            </p>
            <p className="text-sm text-gray-500">在庫十分</p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-yellow-600">{lowStockCount}</p>
            <p className="text-sm text-gray-500">在庫少</p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <p className="text-2xl font-semibold text-red-600">{outOfStockCount}</p>
            <p className="text-sm text-gray-500">在庫切れ</p>
          </div>
        </div>
      </div>

      {/* フィルター・操作 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="商品名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'all' | 'gummy' | 'candy')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="all">すべてのカテゴリ</option>
            <option value="gummy">グミ</option>
            <option value="candy">あめ</option>
          </select>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as 'all' | 'low' | 'out')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="all">すべての在庫状況</option>
            <option value="low">在庫少 (20個未満)</option>
            <option value="out">在庫切れ</option>
          </select>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleBulkStockUpdate(10)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            全商品 +10
          </button>
          <button
            onClick={() => handleBulkStockUpdate(5)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            全商品 +5
          </button>
          <button
            onClick={() => handleBulkStockUpdate(-5)}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm"
          >
            全商品 -5
          </button>
        </div>
      </div>

      {/* 在庫一覧 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            在庫一覧 ({filteredInventory.length}件)
          </h2>
        </div>
        
        {filteredInventory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    カテゴリ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    現在の在庫
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最終更新
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item.stock)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-500">画像</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ¥{item.price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.category === 'gummy' 
                            ? 'bg-pink-100 text-pink-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.category === 'gummy' ? 'グミ' : 'あめ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={item.newStock}
                              onChange={(e) => handleStockChange(item.id, parseInt(e.target.value) || 0)}
                              min="0"
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                            />
                            <span className="text-sm text-gray-500">個</span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            {item.stock}個
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.class}`}>
                          {stockStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.updatedAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {item.isEditing ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleStockUpdate(item.id)}
                              className="text-green-600 hover:text-green-900 p-1"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditCancel(item.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditStart(item.id)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">商品が見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
  )
}