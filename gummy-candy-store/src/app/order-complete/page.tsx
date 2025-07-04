'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { orderService } from '@/lib/indexeddb'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

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
  status: string
  createdAt: Date
}

function OrderCompleteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        router.push('/')
        return
      }

      try {
        const orderData = await orderService.getById(orderId)
        if (orderData) {
          setOrder(orderData as Order)
        } else {
          router.push('/')
        }
      } catch (error) {
        console.error('注文情報の取得に失敗しました:', error)
        router.push('/')
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
          <p className="mt-4 text-gray-600">注文情報を読み込み中...</p>
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
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-600 mb-2">ご注文ありがとうございました！</h1>
        <p className="text-gray-600">注文が正常に完了しました。</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">注文詳細</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">注文番号</h3>
            <p className="text-lg font-mono bg-gray-100 p-2 rounded">{order.id}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">注文日時</h3>
            <p className="text-lg">{new Date(order.createdAt).toLocaleString('ja-JP')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 注文商品 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">注文商品</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-medium">{item.productName}</h3>
                  <p className="text-sm text-gray-600">数量: {item.quantity}</p>
                  <p className="text-sm text-gray-600">単価: ¥{item.price.toLocaleString()}</p>
                </div>
                <p className="font-semibold">¥{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>合計金額</span>
                <span className="text-green-600">¥{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* お客様情報 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">お客様情報</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-gray-700">お名前</h3>
              <p>{order.customerName}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">メールアドレス</h3>
              <p>{order.customerEmail}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">電話番号</h3>
              <p>{order.customerPhone}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">お届け先住所</h3>
              <p>
                〒{order.customerAddress.postalCode}<br />
                {order.customerAddress.prefecture}{order.customerAddress.city}<br />
                {order.customerAddress.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mt-6">
        <h2 className="text-lg font-semibold mb-3">今後の流れ</h2>
        <div className="space-y-2 text-sm">
          <p>• ご注文確認メールを送信いたします（実際のメール送信機能は未実装）</p>
          <p>• 商品の準備が整い次第、発送いたします</p>
          <p>• 発送完了時に追跡番号をお知らせいたします</p>
          <p>• 通常2-3営業日でお届けいたします</p>
        </div>
      </div>

      <div className="text-center mt-8 space-x-4">
        <button
          onClick={() => router.push('/products')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          商品一覧に戻る
        </button>
        <button
          onClick={() => router.push('/orders')}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
        >
          注文履歴を見る
        </button>
      </div>
    </div>
  )
}

export default function OrderCompletePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">注文情報を読み込み中...</p>
        </div>
      </div>
    }>
      <OrderCompleteContent />
    </Suspense>
  )
}