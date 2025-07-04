'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { totalItems } = useCart()
  const { user, isAuthenticated, logout } = useAuth()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-pink-600">
            グミ・あめストア
          </Link>
          
          <div className="flex items-center space-x-4 flex-1">
            <nav className="hidden md:flex space-x-8 items-center">
              <Link href="/" className="text-gray-700 hover:text-pink-600">
                ホーム
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-pink-600">
                商品一覧
              </Link>
              <Link href="/cart" className="text-gray-700 hover:text-pink-600 relative">
                カート
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link href="/orders" className="text-gray-700 hover:text-pink-600">
                注文履歴
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-pink-600">
                お問い合わせ
              </Link>
            </nav>

            {/* 検索フォーム（デスクトップ用） */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center ml-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="商品を検索..."
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 w-64"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-4">
            {/* ユーザーメニュー（デスクトップ用） */}
            {isAuthenticated ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-pink-600"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>{user?.name}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/mypage"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      マイページ
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      注文履歴
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsUserMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="bg-pink-600 text-white hover:bg-pink-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  新規登録
                </Link>
              </div>
            )}

            {/* カートアイコン（モバイル用） */}
            <Link href="/cart" className="md:hidden relative">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* 検索フォーム（モバイル用） */}
              <form onSubmit={handleSearch} className="px-3 py-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="商品を検索..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </form>

              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                ホーム
              </Link>
              <Link href="/products" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                商品一覧
              </Link>
              <Link href="/search" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                商品検索
              </Link>
              <Link href="/cart" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                カート {totalItems > 0 && `(${totalItems})`}
              </Link>
              <Link href="/orders" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                注文履歴
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                お問い合わせ
              </Link>
              
              {/* ユーザー認証関連（モバイル用） */}
              <div className="border-t pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {user?.name} さん
                    </div>
                    <Link href="/mypage" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                      マイページ
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-700 hover:text-pink-600"
                    >
                      ログアウト
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                      ログイン
                    </Link>
                    <Link href="/register" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                      新規登録
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}