import { openDB, DBSchema, IDBPDatabase } from 'idb'

// データベーススキーマの定義
interface GummyStoreDB extends DBSchema {
  products: {
    key: string
    value: {
      id: string
      name: string
      description: string
      price: number
      category: 'gummy' | 'candy'
      imageUrl: string
      stock: number
      createdAt: Date
      updatedAt: Date
    }
    indexes: {
      category: 'gummy' | 'candy'
      name: string
    }
  }
  orders: {
    key: string
    value: {
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
    indexes: {
      status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
      createdAt: Date
    }
  }
  cart: {
    key: string
    value: {
      productId: string
      quantity: number
      addedAt: Date
    }
  }
  reviews: {
    key: string
    value: {
      id: string
      productId: string
      userId: string
      userName: string
      rating: number
      comment: string
      createdAt: Date
      updatedAt: Date
    }
    indexes: {
      productId: string
      userId: string
      rating: number
      createdAt: Date
    }
  }
}

let dbPromise: Promise<IDBPDatabase<GummyStoreDB>>

// データベース初期化
export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<GummyStoreDB>('gummy-store', 2, {
      upgrade(db, oldVersion) {
        // 商品テーブル
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' })
          productStore.createIndex('category', 'category')
          productStore.createIndex('name', 'name')
        }

        // 注文テーブル
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' })
          orderStore.createIndex('status', 'status')
          orderStore.createIndex('createdAt', 'createdAt')
        }

        // カートテーブル
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'productId' })
        }

        // レビューテーブル（バージョン2で追加）
        if (oldVersion < 2 && !db.objectStoreNames.contains('reviews')) {
          const reviewStore = db.createObjectStore('reviews', { keyPath: 'id' })
          reviewStore.createIndex('productId', 'productId')
          reviewStore.createIndex('userId', 'userId')
          reviewStore.createIndex('rating', 'rating')
          reviewStore.createIndex('createdAt', 'createdAt')
        }
      },
    })
  }
  return dbPromise
}

// 商品関連の操作
export const productService = {
  async getAll() {
    const db = await initDB()
    return db.getAll('products')
  },

  async getById(id: string) {
    const db = await initDB()
    return db.get('products', id)
  },

  async getByCategory(category: 'gummy' | 'candy') {
    const db = await initDB()
    return db.getAllFromIndex('products', 'category', category)
  },

  async add(product: GummyStoreDB['products']['value']) {
    const db = await initDB()
    return db.add('products', product)
  },

  async update(product: GummyStoreDB['products']['value']) {
    const db = await initDB()
    return db.put('products', product)
  },

  async delete(id: string) {
    const db = await initDB()
    return db.delete('products', id)
  },
}

// 注文関連の操作
export const orderService = {
  async getAll() {
    const db = await initDB()
    return db.getAll('orders')
  },

  async getById(id: string) {
    const db = await initDB()
    return db.get('orders', id)
  },

  async getByStatus(status: GummyStoreDB['orders']['value']['status']) {
    const db = await initDB()
    return db.getAllFromIndex('orders', 'status', status)
  },

  async add(order: GummyStoreDB['orders']['value']) {
    const db = await initDB()
    return db.add('orders', order)
  },

  async update(order: GummyStoreDB['orders']['value']) {
    const db = await initDB()
    return db.put('orders', order)
  },

  async delete(id: string) {
    const db = await initDB()
    return db.delete('orders', id)
  },
}

// カート関連の操作
export const cartService = {
  async getAll() {
    const db = await initDB()
    return db.getAll('cart')
  },

  async add(productId: string, quantity: number) {
    const db = await initDB()
    const existing = await db.get('cart', productId)
    
    if (existing) {
      existing.quantity += quantity
      return db.put('cart', existing)
    } else {
      return db.add('cart', {
        productId,
        quantity,
        addedAt: new Date(),
      })
    }
  },

  async update(productId: string, quantity: number) {
    const db = await initDB()
    const item = await db.get('cart', productId)
    if (item) {
      item.quantity = quantity
      return db.put('cart', item)
    }
  },

  async remove(productId: string) {
    const db = await initDB()
    return db.delete('cart', productId)
  },

  async clear() {
    const db = await initDB()
    return db.clear('cart')
  },
}

// レビュー関連の操作
export const reviewService = {
  async getAll() {
    const db = await initDB()
    return db.getAll('reviews')
  },

  async getById(id: string) {
    const db = await initDB()
    return db.get('reviews', id)
  },

  async getByProductId(productId: string) {
    const db = await initDB()
    return db.getAllFromIndex('reviews', 'productId', productId)
  },

  async getByUserId(userId: string) {
    const db = await initDB()
    return db.getAllFromIndex('reviews', 'userId', userId)
  },

  async add(review: GummyStoreDB['reviews']['value']) {
    const db = await initDB()
    return db.add('reviews', review)
  },

  async update(review: GummyStoreDB['reviews']['value']) {
    const db = await initDB()
    return db.put('reviews', review)
  },

  async delete(id: string) {
    const db = await initDB()
    return db.delete('reviews', id)
  },

  async getAverageRating(productId: string): Promise<number> {
    const reviews = await this.getByProductId(productId)
    if (reviews.length === 0) return 0
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    return Math.round((totalRating / reviews.length) * 10) / 10
  },

  async getRatingCounts(productId: string): Promise<{ [key: number]: number }> {
    const reviews = await this.getByProductId(productId)
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    reviews.forEach(review => {
      counts[review.rating as keyof typeof counts]++
    })
    
    return counts
  },
}