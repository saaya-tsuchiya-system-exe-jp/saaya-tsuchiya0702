'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline'

export default function MyPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading, updateUser, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      postalCode: '',
      prefecture: '',
      city: '',
      address: '',
    }
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || {
          postalCode: '',
          prefecture: '',
          city: '',
          address: '',
        }
      })
    }
  }, [user, isAuthenticated, loading, router])

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = '名前を入力してください'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address.postalCode ? formData.address : undefined,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('ユーザー情報の更新に失敗しました:', error)
      setErrors({ general: 'ユーザー情報の更新に失敗しました。' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }))
    }
  }

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      logout()
      router.push('/')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">マイページ</h1>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/orders')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            注文履歴
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            ログアウト
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">ユーザー情報</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              編集
            </button>
          )}
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {errors.general}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  お名前 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="山田太郎"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="example@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号
                </label>
                <div className="relative">
                  <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  郵便番号
                </label>
                <input
                  type="text"
                  value={formData.address.postalCode}
                  onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  都道府県
                </label>
                <select
                  value={formData.address.prefecture}
                  onChange={(e) => handleInputChange('address.prefecture', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">選択してください</option>
                  <option value="東京都">東京都</option>
                  <option value="神奈川県">神奈川県</option>
                  <option value="千葉県">千葉県</option>
                  <option value="埼玉県">埼玉県</option>
                  <option value="大阪府">大阪府</option>
                  <option value="愛知県">愛知県</option>
                  <option value="福岡県">福岡県</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  市区町村
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="渋谷区"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所
              </label>
              <div className="relative">
                <MapPinIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.address.address}
                  onChange={(e) => handleInputChange('address.address', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="道玄坂1-2-3"
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '更新中...' : '更新'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setErrors({})
                  // フォームデータをリセット
                  setFormData({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    address: user.address || {
                      postalCode: '',
                      prefecture: '',
                      city: '',
                      address: '',
                    }
                  })
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                キャンセル
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-lg">{user.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-lg">{user.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-lg">{user.phone || '未設定'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">登録日</label>
                <span className="text-lg">{new Date(user.createdAt).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>

            {user.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-1" />
                  <div>
                    <p className="text-lg">
                      〒{user.address.postalCode}<br />
                      {user.address.prefecture}{user.address.city}<br />
                      {user.address.address}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}