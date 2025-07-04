'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useRouter } from 'next/navigation'
import { orderService } from '@/lib/indexeddb'

interface CustomerInfo {
  name: string
  email: string
  phone: string
  address: string
  postalCode: string
  city: string
  prefecture: string
}

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart()
  const router = useRouter()
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    postalCode: '',
    city: '',
    prefecture: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {}

    if (!customerInfo.name.trim()) newErrors.name = '名前を入力してください'
    if (!customerInfo.email.trim()) newErrors.email = 'メールアドレスを入力してください'
    else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) newErrors.email = '有効なメールアドレスを入力してください'
    if (!customerInfo.phone.trim()) newErrors.phone = '電話番号を入力してください'
    if (!customerInfo.address.trim()) newErrors.address = '住所を入力してください'
    if (!customerInfo.postalCode.trim()) newErrors.postalCode = '郵便番号を入力してください'
    if (!customerInfo.city.trim()) newErrors.city = '市区町村を入力してください'
    if (!customerInfo.prefecture.trim()) newErrors.prefecture = '都道府県を選択してください'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (items.length === 0) {
      alert('カートが空です')
      return
    }

    setIsSubmitting(true)

    try {
      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const order = {
        id: orderId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerAddress: {
          postalCode: customerInfo.postalCode,
          prefecture: customerInfo.prefecture,
          city: customerInfo.city,
          address: customerInfo.address,
        },
        items: items.map(item => ({
          productId: item.productId,
          productName: item.product?.name || '',
          quantity: item.quantity,
          price: item.product?.price || 0,
        })),
        totalAmount,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await orderService.add(order)
      await clearCart()
      
      router.push(`/order-complete?orderId=${orderId}`)
    } catch (error) {
      console.error('注文処理に失敗しました:', error)
      alert('注文処理に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">カートが空です</h1>
          <p className="text-gray-600 mb-8">商品をカートに追加してから注文手続きを行ってください。</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            商品一覧へ戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">注文確認</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 注文内容 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">注文内容</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between items-center border-b pb-2">
                <div>
                  <h3 className="font-medium">{item.product?.name}</h3>
                  <p className="text-sm text-gray-600">数量: {item.quantity}</p>
                </div>
                <p className="font-semibold">¥{((item.product?.price || 0) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>合計金額</span>
                <span>¥{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* お客様情報入力フォーム */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">お客様情報</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="山田太郎"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="example@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="090-1234-5678"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                郵便番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerInfo.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.postalCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123-4567"
              />
              {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                都道府県 <span className="text-red-500">*</span>
              </label>
              <select
                value={customerInfo.prefecture}
                onChange={(e) => handleInputChange('prefecture', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.prefecture ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">選択してください</option>
                <option value="東京都">東京都</option>
                <option value="神奈川県">神奈川県</option>
                <option value="千葉県">千葉県</option>
                <option value="埼玉県">埼玉県</option>
                <option value="大阪府">大阪府</option>
                <option value="愛知県">愛知県</option>
                <option value="福岡県">福岡県</option>
                {/* 他の都道府県も追加可能 */}
              </select>
              {errors.prefecture && <p className="text-red-500 text-sm mt-1">{errors.prefecture}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                市区町村 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerInfo.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="渋谷区"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customerInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="道玄坂1-2-3"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {isSubmitting ? '注文処理中...' : '注文を確定する'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}