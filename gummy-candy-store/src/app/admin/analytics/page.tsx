'use client'

import { useEffect, useState } from 'react'
import { productService, orderService } from '@/lib/indexeddb'
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topSellingProducts: Array<{
    id: string
    name: string
    category: string
    sales: number
    revenue: number
  }>
  categoryBreakdown: Array<{
    category: string
    count: number
    revenue: number
    percentage: number
  }>
  monthlyTrends: Array<{
    month: string
    orders: number
    revenue: number
  }>
  orderStatusBreakdown: Array<{
    status: string
    count: number
    percentage: number
  }>
  lowStockAlerts: Array<{
    id: string
    name: string
    stock: number
  }>
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingProducts: [],
    categoryBreakdown: [],
    monthlyTrends: [],
    orderStatusBreakdown: [],
    lowStockAlerts: []
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      const [products, orders] = await Promise.all([
        productService.getAll(),
        orderService.getAll()
      ])

      // 日付フィルタリング
      const now = new Date()
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (dateRange) {
          case '7d': return daysDiff <= 7
          case '30d': return daysDiff <= 30
          case '90d': return daysDiff <= 90
          case 'all': return true
          default: return true
        }
      })

      // 基本統計
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      const totalOrders = filteredOrders.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // 商品別売上ランキング（仮データ）
      const topSellingProducts = products
        .map(product => ({
          id: product.id,
          name: product.name,
          category: product.category === 'gummy' ? 'グミ' : 'あめ',
          sales: Math.floor(Math.random() * 100) + 10, // 仮データ
          revenue: (Math.floor(Math.random() * 100) + 10) * product.price
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)

      // カテゴリ別分析
      const gummyProducts = products.filter(p => p.category === 'gummy')
      const candyProducts = products.filter(p => p.category === 'candy')
      const gummyRevenue = Math.floor(totalRevenue * 0.6) // 仮データ
      const candyRevenue = totalRevenue - gummyRevenue

      const categoryBreakdown = [
        {
          category: 'グミ',
          count: gummyProducts.length,
          revenue: gummyRevenue,
          percentage: totalRevenue > 0 ? (gummyRevenue / totalRevenue) * 100 : 0
        },
        {
          category: 'あめ',
          count: candyProducts.length,
          revenue: candyRevenue,
          percentage: totalRevenue > 0 ? (candyRevenue / totalRevenue) * 100 : 0
        }
      ]

      // 月別トレンド（仮データ）
      const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return {
          month: date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' }),
          orders: Math.floor(Math.random() * 50) + 10,
          revenue: Math.floor(Math.random() * 100000) + 20000
        }
      }).reverse()

      // 注文ステータス分析
      const statusCounts = {
        pending: filteredOrders.filter(o => o.status === 'pending').length,
        processing: filteredOrders.filter(o => o.status === 'processing').length,
        shipped: filteredOrders.filter(o => o.status === 'shipped').length,
        delivered: filteredOrders.filter(o => o.status === 'delivered').length,
        cancelled: filteredOrders.filter(o => o.status === 'cancelled').length
      }

      const orderStatusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
        status: status === 'pending' ? '保留中' :
                status === 'processing' ? '処理中' :
                status === 'shipped' ? '発送済み' :
                status === 'delivered' ? '配達完了' : 'キャンセル',
        count,
        percentage: totalOrders > 0 ? (count / totalOrders) * 100 : 0
      }))

      // 在庫アラート
      const lowStockAlerts = products
        .filter(product => product.stock < 10)
        .map(product => ({
          id: product.id,
          name: product.name,
          stock: product.stock
        }))
        .sort((a, b) => a.stock - b.stock)

      setAnalytics({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topSellingProducts,
        categoryBreakdown,
        monthlyTrends,
        orderStatusBreakdown,
        lowStockAlerts
      })
    } catch (error) {
      console.error('分析データの読み込みに失敗しました:', error)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">統計・レポート</h1>
          <p className="text-gray-600">売上や商品の統計情報を確認します。</p>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="7d">過去7日間</option>
            <option value="30d">過去30日間</option>
            <option value="90d">過去90日間</option>
            <option value="all">全期間</option>
          </select>
        </div>
      </div>

      {/* KPI カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">総売上</p>
              <p className="text-2xl font-semibold text-gray-900">
                ¥{analytics.totalRevenue.toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12.5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">注文数</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.totalOrders}
              </p>
              <div className="flex items-center mt-1">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">平均注文額</p>
              <p className="text-2xl font-semibold text-gray-900">
                ¥{Math.round(analytics.averageOrderValue).toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">-2.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 商品別売上ランキング */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">商品別売上ランキング</h2>
          <div className="space-y-4">
            {analytics.topSellingProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{product.sales}個</p>
                  <p className="text-xs text-gray-500">¥{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* カテゴリ別分析 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ別分析</h2>
          <div className="space-y-4">
            {analytics.categoryBreakdown.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{category.category}</span>
                  <span className="text-sm text-gray-500">
                    {category.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      category.category === 'グミ' ? 'bg-pink-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{category.count}商品</span>
                  <span>¥{category.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 月別売上トレンド */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">月別売上トレンド</h2>
          <div className="space-y-3">
            {analytics.monthlyTrends.map((trend, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{trend.month}</p>
                  <p className="text-xs text-gray-500">{trend.orders}件の注文</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ¥{trend.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 注文ステータス分析 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">注文ステータス分析</h2>
          <div className="space-y-3">
            {analytics.orderStatusBreakdown.map((status) => (
              <div key={status.status} className="flex justify-between items-center">
                <span className="text-sm text-gray-900">{status.status}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{status.count}件</span>
                  <span className="text-xs text-gray-400">
                    ({status.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 在庫アラート */}
      {analytics.lowStockAlerts.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">在庫アラート</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.lowStockAlerts.map((alert) => (
              <div key={alert.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{alert.name}</p>
                    <p className="text-xs text-red-600">残り{alert.stock}個</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}