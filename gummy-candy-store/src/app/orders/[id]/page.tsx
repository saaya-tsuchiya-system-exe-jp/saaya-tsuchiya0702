'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { orderService } from '@/lib/indexeddb'
import { ClockIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

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
  pending: { 
    label: '注文受付', 
    color: 'text-yellow-600 bg-yellow-100', 
    icon: ClockIcon,
    description: 'ご注文を受け付けました。商品の準備を開始いたします。'
  },
  processing: { 
    label: '処理中', 
    color: 'text-blue-600 bg-blue-100', 
    icon: ClockIcon,
    description: '商品の準備中です。発送まで今しばらくお待ちください。'
  },
  shipped: { 
    label: '発送済み', 
    color: 'text-purple-600 bg-purple-100', 
    icon: TruckIcon,
    description: '商品を発送いたしました。お届けまで今しばらくお待ちください。'
  },
  delivered: { 
    label: '配達完了', 
    color: 'text-green-600 bg-green-100', 
    icon: CheckCircleIcon,
    description: '商品をお届けいたしました。ありがとうございました。'
  },
  cancelled: { 
    label: 'キャンセル', 
    color: 'text-red-600 bg-red-100', 
    icon: XCircleIcon,
    description: 'ご注文がキャンセルされました。'
  },
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        router.push('/orders')
        return
      }

      try {
        const orderData = await orderService.getById(orderId)
        if (orderData) {
          setOrder(orderData as Order)
        } else {
          router.push('/orders')
        }
      } catch (error) {
        console.error('注文詳細の取得に失敗しました:', error)
        router.push('/orders')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [orderId, router])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">注文詳細を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">注文が見つかりません</h1>
          <button
            onClick={() => router.push('/orders')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            注文履歴に戻る
          </button>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[order.status]
  const StatusIcon = statusInfo.icon

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          注文履歴に戻る
        </button>
        <h1 className="text-3xl font-bold">注文詳細</h1>
      </div>

      {/* ステータス表示 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <StatusIcon className="h-8 w-8 mr-3" />
          <div>
            <span className={`px-4 py-2 rounded-full text-lg font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
        <p className="text-gray-600">{statusInfo.description}</p>
      </div>

      {/* 注文基本情報 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">注文情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">注文番号</h3>
            <p className="text-lg font-mono bg-gray-100 p-3 rounded">{order.id}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">注文日時</h3>
            <p className="text-lg">{new Date(order.createdAt).toLocaleString('ja-JP')}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">最終更新</h3>
            <p className="text-lg">{new Date(order.updatedAt).toLocaleString('ja-JP')}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">合計金額</h3>
            <p className="text-2xl font-bold text-green-600">¥{order.totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 注文商品詳細 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">注文商品</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-lg">{item.productName}</h3>
                  <span className="text-lg font-semibold">
                    ¥{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>単価: ¥{item.price.toLocaleString()}</span>
                  <span>数量: {item.quantity}個</span>
                </div>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>合計</span>
                <span className="text-green-600">¥{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* お客様情報・配送先 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">お客様情報・配送先</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-1">お名前</h3>
              <p className="text-lg">{order.customerName}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">メールアドレス</h3>
              <p className="text-lg break-all">{order.customerEmail}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">電話番号</h3>
              <p className="text-lg">{order.customerPhone}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">配送先住所</h3>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-lg">
                  〒{order.customerAddress.postalCode}<br />
                  {order.customerAddress.prefecture}{order.customerAddress.city}<br />
                  {order.customerAddress.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 配送状況タイムライン */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">配送状況</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-4 ${
              ['pending', 'processing', 'shipped', 'delivered'].includes(order.status) 
                ? 'bg-green-500' 
                : 'bg-gray-300'
            }`}></div>
            <div>
              <p className="font-medium">注文受付</p>
              <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString('ja-JP')}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-4 ${
              ['processing', 'shipped', 'delivered'].includes(order.status) 
                ? 'bg-green-500' 
                : 'bg-gray-300'
            }`}></div>
            <div>
              <p className="font-medium">商品準備中</p>
              {['processing', 'shipped', 'delivered'].includes(order.status) && (
                <p className="text-sm text-gray-600">準備を開始しました</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-4 ${
              ['shipped', 'delivered'].includes(order.status) 
                ? 'bg-green-500' 
                : 'bg-gray-300'
            }`}></div>
            <div>
              <p className="font-medium">発送完了</p>
              {['shipped', 'delivered'].includes(order.status) && (
                <p className="text-sm text-gray-600">商品を発送しました</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-4 ${
              order.status === 'delivered' 
                ? 'bg-green-500' 
                : 'bg-gray-300'
            }`}></div>
            <div>
              <p className="font-medium">配達完了</p>
              {order.status === 'delivered' && (
                <p className="text-sm text-gray-600">お届け完了しました</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="text-center mt-8 space-x-4">
        <button
          onClick={() => router.push('/orders')}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          注文履歴に戻る
        </button>
        <button
          onClick={() => router.push('/products')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          商品一覧を見る
        </button>
      </div>
    </div>
  )
}