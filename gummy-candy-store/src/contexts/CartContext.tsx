'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { cartService, productService } from '@/lib/indexeddb'

// カートアイテムの型定義
export interface CartItem {
  productId: string
  quantity: number
  addedAt: Date
  product?: {
    id: string
    name: string
    price: number
    imageUrl: string
    stock: number
  }
}

// カート状態の型定義
interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  loading: boolean
}

// アクションの型定義
type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }

// 初期状態
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  loading: false,
}

// リデューサー関数
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ITEMS':
      const items = action.payload
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
      const totalAmount = items.reduce((sum, item) => 
        sum + (item.product?.price || 0) * item.quantity, 0
      )
      return { ...state, items, totalItems, totalAmount }
    
    case 'ADD_ITEM':
      const newItems = [...state.items, action.payload]
      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: newItems.reduce((sum, item) => 
          sum + (item.product?.price || 0) * item.quantity, 0
        ),
      }
    
    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      )
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedItems.reduce((sum, item) => 
          sum + (item.product?.price || 0) * item.quantity, 0
        ),
      }
    
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.productId !== action.payload)
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: filteredItems.reduce((sum, item) => 
          sum + (item.product?.price || 0) * item.quantity, 0
        ),
      }
    
    case 'CLEAR_CART':
      return { ...state, items: [], totalItems: 0, totalAmount: 0 }
    
    default:
      return state
  }
}

// コンテキストの型定義
interface CartContextType extends CartState {
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateCartItem: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

// コンテキストの作成
const CartContext = createContext<CartContextType | undefined>(undefined)

// プロバイダーコンポーネント
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // カートデータを読み込む関数
  const loadCartData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const cartItems = await cartService.getAll()
      
      // 商品情報を取得してカートアイテムに追加
      const itemsWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await productService.getById(item.productId)
          return {
            ...item,
            product: product ? {
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              stock: product.stock,
            } : undefined,
          }
        })
      )
      
      dispatch({ type: 'SET_ITEMS', payload: itemsWithProducts })
    } catch (error) {
      console.error('カートデータの読み込みに失敗しました:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // カートに商品を追加
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      await cartService.add(productId, quantity)
      await loadCartData() // カートデータを再読み込み
    } catch (error) {
      console.error('カートへの追加に失敗しました:', error)
      throw error
    }
  }

  // カートアイテムの数量を更新
  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId)
        return
      }
      
      await cartService.update(productId, quantity)
      dispatch({ type: 'UPDATE_ITEM', payload: { productId, quantity } })
    } catch (error) {
      console.error('カートアイテムの更新に失敗しました:', error)
      throw error
    }
  }

  // カートから商品を削除
  const removeFromCart = async (productId: string) => {
    try {
      await cartService.remove(productId)
      dispatch({ type: 'REMOVE_ITEM', payload: productId })
    } catch (error) {
      console.error('カートからの削除に失敗しました:', error)
      throw error
    }
  }

  // カートをクリア
  const clearCart = async () => {
    try {
      await cartService.clear()
      dispatch({ type: 'CLEAR_CART' })
    } catch (error) {
      console.error('カートのクリアに失敗しました:', error)
      throw error
    }
  }

  // カートデータを再読み込み
  const refreshCart = async () => {
    await loadCartData()
  }

  // 初回読み込み
  useEffect(() => {
    loadCartData()
  }, [])

  const contextValue: CartContextType = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  }

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

// カスタムフック
export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}