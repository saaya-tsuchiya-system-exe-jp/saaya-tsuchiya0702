'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { orderService, productService } from '@/lib/indexeddb'
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

interface OrderWithProducts extends Order {
  itemsWithProducts: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<OrderWithProducts[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const allOrders = await orderService.getAll()
      
      // 商品情報を取得して注文に追加
      const ordersWithProducts = await Promise.all(
        allOrders.map(async (order) => {
          const itemsWithProducts = await Promise.all(
            order.items.map(async (item) => {
              const product = await productService.getById(item.productId)
              return {
                ...item,
                productName: product?.name || '商品が見つかりません'
              }
            })
          )
          
          return {
            ...order,
            itemsWithProducts
          }
        })
      )
      
      // 作成日時で降順ソート
      ordersWithProducts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      setOrders(ordersWithProducts)
    } catch (error) {
      console.error('注文データの読み込みに失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      const order = orders.find(o => o.id === orderId)
      if (!order) return

      const updatedOrder = {
        ...order,
        status: newStatus,
        updatedAt: new Date()
      }

      await orderService.update(updatedOrder)
      
      // ローカル状態を更新
      setOrders(orders.map(o => 
        o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o
      ))
    } catch (error) {
      console.error('注文ステータスの更新に失敗しました:', error)
      alert('注文ステータスの更新に失敗しました。')
    }
  }

  // フィルタリング
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-500" />
      case 'shipped':
        return <TruckIcon className="h-5 w-5 text-green-500" />
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '保留中'
      case 'processing': return '処理中'
      case 'shipped': return '発送済み'
      case 'delivered': return '配達完了'
      case 'cancelled': return 'キャンセル'
      default: return status
    }
  }

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-green-100 text-green-800'
      case 'delivered':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">注文管理</h1>
        <p className="text-gray-600">注文の確認、ステータス更新を行います。</p>
      </div>

      {/* フィルター */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="顧客名、メール、注文IDで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | Order['status'])}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="all">すべてのステータス</option>
            <option value="pending">保留中</option>
            <option value="processing">処理中</option>
            <option value="shipped">発送済み</option>
            <option value="delivered">配達完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
        </div>
      </div>

      {/* 注文一覧 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            注文一覧 ({filteredOrders.length}件)
          </h2>
        </div>
        
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    注文ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    顧客情報
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    注文日
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerEmail}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerPhone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.itemsWithProducts.map((item, index) => (
                          <div key={index} className="mb-1">
                            {item.productName} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                          className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusBadgeClass(order.status)}`}
                        >
                          <option value="pending">保留中</option>
                          <option value="processing">処理中</option>
                          <option value="shipped">発送済み</option>
                          <option value="delivered">配達完了</option>
                          <option value="cancelled">キャンセル</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">注文が見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
  )
}