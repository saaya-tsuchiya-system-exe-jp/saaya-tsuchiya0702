'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 簡単なバリデーション
    if (!formData.name || !formData.email || !formData.message) {
      alert('必須項目を入力してください。')
      setIsSubmitting(false)
      return
    }

    // デモ用の送信処理（実際のメール送信は未実装）
    setTimeout(() => {
      alert('お問い合わせを受け付けました。ありがとうございます！\n\n※これはデモ版です。実際のメール送信は行われません。')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">お問い合わせ</h1>
        <p className="text-gray-600">
          ご質問やご要望がございましたら、お気軽にお問い合わせください。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* お問い合わせフォーム */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">お問い合わせフォーム</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="山田太郎"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                件名
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">件名を選択してください</option>
                <option value="商品について">商品について</option>
                <option value="注文について">注文について</option>
                <option value="配送について">配送について</option>
                <option value="返品・交換について">返品・交換について</option>
                <option value="その他">その他</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                メッセージ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="お問い合わせ内容をご記入ください"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                isSubmitting
                  ? 'bg-pink-400 text-white cursor-wait'
                  : 'bg-pink-600 text-white hover:bg-pink-700'
              }`}
            >
              {isSubmitting ? '送信中...' : '送信する'}
            </button>
          </form>
        </div>

        {/* 店舗情報・FAQ */}
        <div className="space-y-8">
          {/* 店舗情報 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">店舗情報</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">グミ・あめストア</h3>
                <p className="text-gray-600 text-sm mt-1">
                  美味しいグミとあめの専門店
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">営業時間</h3>
                <p className="text-gray-600 text-sm mt-1">
                  平日: 9:00 - 18:00<br />
                  土日祝: 10:00 - 17:00
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">お問い合わせ対応時間</h3>
                <p className="text-gray-600 text-sm mt-1">
                  平日: 9:00 - 17:00<br />
                  ※土日祝は休業
                </p>
              </div>
            </div>
          </div>

          {/* よくある質問 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">よくある質問</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Q. 送料はかかりますか？</h3>
                <p className="text-gray-600 text-sm">
                  A. 現在、全国一律で送料無料でお届けしています。
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Q. 配送にはどのくらいかかりますか？</h3>
                <p className="text-gray-600 text-sm">
                  A. ご注文から2-3営業日でお届けします。
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Q. 返品・交換は可能ですか？</h3>
                <p className="text-gray-600 text-sm">
                  A. 商品到着後7日以内であれば、未開封の商品に限り返品・交換を承ります。
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Q. アレルギー情報は確認できますか？</h3>
                <p className="text-gray-600 text-sm">
                  A. 各商品ページにアレルギー情報を記載予定です。詳細はお問い合わせください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}