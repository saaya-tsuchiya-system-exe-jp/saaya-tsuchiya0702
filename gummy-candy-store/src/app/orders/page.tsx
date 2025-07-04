'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { orderService } from '@/lib/indexeddb'
import { ClockIcon, TruckIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: {
    postalCode: string
    prefecture: string
    city: string
    address: string
  }
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

const statusConfig = {
  pending: { label: '注文受付', color: 'text-yellow-600 bg-yellow-100', icon: ClockIcon },
  processing: { label: '処理中', color: 'text-blue-600 bg-blue-100', icon: ClockIcon },
  shipped: { label: '発送済み', color: 'text-purple-600 bg-purple-100', icon: TruckIcon },
  delivered: { label: '配達完了', color: 'text-green-600 bg-green-100', icon: CheckCircleIcon },
  cancelled: { label: 'キャンセル', color: 'text-red-600 bg-red-100', icon: XCircleIcon },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | Order['status']>('all')
  const router = useRouter()

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const orderData = await orderService.getAll()
        // 日付順でソート（新しい順）
        const sortedOrders = orderData.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setOrders(sortedOrders as Order[])
      } catch (error) {
        console.error('注文履歴の取得に失敗しました:', error)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter)

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">注文履歴を読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">注文履歴</h1>
        <button
          onClick={() => router.push('/products')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          商品一覧へ
        </button>
      </div>

      {/* フィルター */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            すべて ({orders.length})
          </button>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = orders.filter(order => order.status === status).length
            return (
              <button
                key={status}
                onClick={() => setFilter(status as Order['status'])}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {config.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <ClockIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            {filter === 'all' ? '注文履歴がありません' : `${statusConfig[filter as keyof typeof statusConfig]?.label}の注文がありません`}
          </h2>
          <p className="text-gray-500 mb-6">
            {filter === 'all' ? '商品を注文すると、こちらに履歴が表示されます。' : '他のステータスの注文を確認してください。'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => router.push('/products')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              商品を見る
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = statusConfig[order.status]
            const StatusIcon = statusInfo.icon
            
            return (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex items-center space-x-3 mb-2 lg:mb-0">
                    <StatusIcon className="h-5 w-5" />
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      注文日: {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-semibold">
                      ¥{order.totalAmount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                    >
                      詳細を見る
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">注文番号</h3>
                      <p className="text-sm font-mono bg-gray-100 p-2 rounded">{order.id}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">お届け先</h3>
                      <p className="text-sm">
                        {order.customerName}<br />
                        {order.customerAddress.prefecture}{order.customerAddress.city}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-medium text-gray-700 mb-2">注文商品</h3>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {item.productName} × {item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}