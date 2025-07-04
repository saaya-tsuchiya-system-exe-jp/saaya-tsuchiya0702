'use client'

import { useEffect, useState } from 'react'
import { productService, orderService } from '@/lib/indexeddb'
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  CurrencyYenIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  lowStockProducts: number
  recentOrders: any[]
  topProducts: Array<{ name: string; sales: number }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    recentOrders: [],
    topProducts: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // 商品データを取得
      const products = await productService.getAll()
      const orders = await orderService.getAll()
      
      // 統計を計算
      const totalProducts = products.length
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
      const lowStockProducts = products.filter(product => product.stock < 10).length
      
      // 最近の注文（最新5件）
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
      
      // 商品別売上ランキング（仮データ）
      const topProducts = products
        .map(product => ({
          name: product.name,
          sales: Math.floor(Math.random() * 100) // 実際の売上データがないため仮データ
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)
      
      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStockProducts,
        recentOrders,
        topProducts
      })
    } catch (error) {
      console.error('ダッシュボードデータの読み込みに失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

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
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ダッシュボード</h2>
        <p className="text-gray-600">管理画面へようこそ。こちらから商品や注文の管理を行えます。</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShoppingBagIcon className="h-8 w-8 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">総商品数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">総注文数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyYenIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">総売上</p>
              <p className="text-2xl font-semibold text-gray-900">¥{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">在庫少</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.lowStockProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近の注文 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の注文</h3>
          {stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">¥{order.totalAmount.toLocaleString()}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                      order.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status === 'pending' ? '保留中' :
                       order.status === 'processing' ? '処理中' :
                       order.status === 'shipped' ? '発送済み' :
                       order.status === 'delivered' ? '配達完了' : 'キャンセル'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">注文がありません</p>
          )}
        </div>

        {/* 商品別売上ランキング */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">商品別売上ランキング</h3>
          {stats.topProducts.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => (
                <div key={product.name} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-900">{product.name}</span>
                  </div>
                  <span className="text-gray-500">{product.sales}個</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">データがありません</p>
          )}
        </div>
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">商品管理</h3>
          <p className="text-gray-600 mb-4">商品の追加、編集、削除を行います。</p>
          <a
            href="/admin/products"
            className="inline-block bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition-colors"
          >
            商品管理へ
          </a>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">注文管理</h3>
          <p className="text-gray-600 mb-4">注文の確認、ステータス更新を行います。</p>
          <a
            href="/admin/orders"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            注文管理へ
          </a>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">在庫管理</h3>
          <p className="text-gray-600 mb-4">在庫状況の確認と更新を行います。</p>
          <a
            href="/admin/inventory"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            在庫管理へ
          </a>
        </div>
      </div>
    </div>
  )
}