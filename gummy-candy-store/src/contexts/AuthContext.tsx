'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

// ユーザー情報の型定義
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  address?: {
    postalCode: string
    prefecture: string
    city: string
    address: string
  }
  createdAt: Date
}

// 認証状態の型定義
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

// アクションの型定義
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }

// 初期状態
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
}

// リデューサー関数
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      }
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      }
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      }
    
    default:
      return state
  }
}

// コンテキストの型定義
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>
  updateUser: (userData: Partial<User>) => Promise<void>
}

// コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ローカルストレージのキー
const STORAGE_KEY = 'gummy-store-auth'
const USERS_KEY = 'gummy-store-users'

// プロバイダーコンポーネント
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // ローカルストレージからユーザー情報を読み込む
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem(STORAGE_KEY)
        if (savedUser) {
          const user = JSON.parse(savedUser)
          dispatch({ type: 'LOGIN', payload: user })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('ユーザー情報の読み込みに失敗しました:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadUser()
  }, [])

  // ユーザー情報をローカルストレージに保存
  const saveUser = (user: User) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } catch (error) {
      console.error('ユーザー情報の保存に失敗しました:', error)
    }
  }

  // ユーザー情報をローカルストレージから削除
  const removeUser = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('ユーザー情報の削除に失敗しました:', error)
    }
  }

  // 登録済みユーザーを取得
  const getUsers = (): User[] => {
    try {
      const users = localStorage.getItem(USERS_KEY)
      return users ? JSON.parse(users) : []
    } catch (error) {
      console.error('ユーザーリストの取得に失敗しました:', error)
      return []
    }
  }

  // ユーザーリストを保存
  const saveUsers = (users: User[]) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    } catch (error) {
      console.error('ユーザーリストの保存に失敗しました:', error)
    }
  }

  // ログイン機能
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      // 簡易認証（実際のプロジェクトでは適切な認証システムを使用）
      const users = getUsers()
      const user = users.find(u => u.email === email)
      
      if (user) {
        // パスワードチェックは簡略化（実際は暗号化されたパスワードと比較）
        dispatch({ type: 'LOGIN', payload: user })
        saveUser(user)
        return true
      } else {
        // デモ用：存在しないユーザーの場合は自動登録
        const newUser: User = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: email.split('@')[0], // メールアドレスの@より前を名前として使用
          email,
          createdAt: new Date(),
        }
        
        const updatedUsers = [...users, newUser]
        saveUsers(updatedUsers)
        
        dispatch({ type: 'LOGIN', payload: newUser })
        saveUser(newUser)
        return true
      }
    } catch (error) {
      console.error('ログインに失敗しました:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
      return false
    }
  }

  // ログアウト機能
  const logout = () => {
    dispatch({ type: 'LOGOUT' })
    removeUser()
  }

  // ユーザー登録機能
  const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const users = getUsers()
      
      // メールアドレスの重複チェック
      if (users.some(u => u.email === userData.email)) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return false
      }
      
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
      }
      
      const updatedUsers = [...users, newUser]
      saveUsers(updatedUsers)
      
      dispatch({ type: 'LOGIN', payload: newUser })
      saveUser(newUser)
      return true
    } catch (error) {
      console.error('ユーザー登録に失敗しました:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
      return false
    }
  }

  // ユーザー情報更新機能
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!state.user) return

    try {
      const updatedUser = { ...state.user, ...userData }
      
      // ユーザーリストも更新
      const users = getUsers()
      const updatedUsers = users.map(u => 
        u.id === state.user!.id ? updatedUser : u
      )
      saveUsers(updatedUsers)
      
      dispatch({ type: 'UPDATE_USER', payload: updatedUser })
      saveUser(updatedUser)
    } catch (error) {
      console.error('ユーザー情報の更新に失敗しました:', error)
      throw error
    }
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    register,
    updateUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// カスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}