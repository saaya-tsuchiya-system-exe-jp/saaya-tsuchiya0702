'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { orderService, productService } from '@/lib/indexeddb'
import { 
  ArrowLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon
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
    productCategory: string
    quantity: number
    price: number
    subtotal: number
  }>
}

export default function OrderDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [order, setOrder] = useState<OrderWithProducts | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [params.id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const orderData = await orderService.getById(params.id)
      
      if (!orderData) {
        alert('注文が見つかりませんでした。')
        router.push('/admin/orders')
        return
      }

      // 商品情報を取得
      const itemsWithProducts = await Promise.all(
        orderData.items.map(async (item) => {
          const product = await productService.getById(item.productId)
          return {
            ...item,
            productName: product?.name || '商品が見つかりません',
            productCategory: product?.category === 'gummy' ? 'グミ' : 'あめ',
            subtotal: item.price * item.quantity
          }
        })
      )

      setOrder({
        ...orderData,
        itemsWithProducts
      })
    } catch (error) {
      console.error('注文データの読み込みに失敗しました:', error)
      alert('注文データの読み込みに失敗しました。')
      router.push('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!order) return

    try {
      setUpdating(true)
      const updatedOrder = {
        ...order,
        status: newStatus,
        updatedAt: new Date()
      }

      await orderService.update(updatedOrder)
      setOrder({ ...order, status: newStatus, updatedAt: new Date() })
    } catch (error) {
      console.error('注文ステータスの更新に失敗しました:', error)
      alert('注文ステータスの更新に失敗しました。')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-6 w-6 text-yellow-500" />
      case 'processing':
        return <ClockIcon className="h-6 w-6 text-blue-500" />
      case 'shipped':
        return <TruckIcon className="h-6 w-6 text-green-500" />
      case 'delivered':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />
      case 'cancelled':
        return <XCircleIcon className="h-6 w-6 text-red-500" />
      default:
        return <ClockIcon className="h-6 w-6 text-gray-500" />
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

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">注文が見つかりませんでした。</p>
        <Link
          href="/admin/orders"
          className="mt-4 inline-block text-pink-600 hover:text-pink-800"
        >
          注文一覧に戻る
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/orders"
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">注文詳細</h1>
          <p className="text-gray-600">注文ID: {order.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* 注文商品 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">注文商品</h2>
            <div className="space-y-4">
              {order.itemsWithProducts.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.productName}</h3>
                    <p className="text-sm text-gray-500">{item.productCategory}</p>
                    <p className="text-sm text-gray-600">
                      ¥{item.price.toLocaleString()} × {item.quantity}個
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ¥{item.subtotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">合計金額</span>
                  <span className="text-xl font-bold text-pink-600">
                    ¥{order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 注文履歴 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">注文履歴</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">注文受付</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>
              
              {order.updatedAt.getTime() !== order.createdAt.getTime() && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      ステータス更新: {getStatusText(order.status)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.updatedAt).toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 注文ステータス */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">注文ステータス</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(order.status)}
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  ステータスを変更
                </label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value as Order['status'])}
                  disabled={updating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 disabled:opacity-50"
                >
                  <option value="pending">保留中</option>
                  <option value="processing">処理中</option>
                  <option value="shipped">発送済み</option>
                  <option value="delivered">配達完了</option>
                  <option value="cancelled">キャンセル</option>
                </select>
                {updating && (
                  <p className="text-sm text-gray-500">更新中...</p>
                )}
              </div>
            </div>
          </div>

          {/* 顧客情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">顧客情報</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">氏名</p>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">メールアドレス</p>
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">電話番号</p>
                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 注文情報 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">注文情報</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">注文日時</p>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">最終更新</p>
                <p className="text-sm text-gray-600">
                  {new Date(order.updatedAt).toLocaleString('ja-JP')}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">商品点数</p>
                <p className="text-sm text-gray-600">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)}点
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}