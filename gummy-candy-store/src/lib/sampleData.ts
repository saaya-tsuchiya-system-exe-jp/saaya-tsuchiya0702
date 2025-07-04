// サンプル商品データ
export const sampleProducts = [
  {
    id: 'gummy-001',
    name: 'フルーツグミミックス',
    description: '5種類のフルーツ味が楽しめる人気のグミです。ストロベリー、オレンジ、アップル、グレープ、レモンの味が入っています。',
    price: 280,
    category: 'gummy' as const,
    imageUrl: '/images/fruit-gummy-mix.jpg',
    stock: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'gummy-002',
    name: 'コーラグミ',
    description: 'コーラの爽やかな味わいを再現したグミです。シュワシュワとした食感が楽しめます。',
    price: 150,
    category: 'gummy' as const,
    imageUrl: '/images/cola-gummy.jpg',
    stock: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'gummy-003',
    name: 'ハリボー ゴールドベア',
    description: 'ドイツ生まれの世界的に有名なグミです。5つのフルーツ味が楽しめます。',
    price: 320,
    category: 'gummy' as const,
    imageUrl: '/images/haribo-gold-bear.jpg',
    stock: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'gummy-004',
    name: 'ソーダグミ',
    description: 'ソーダの爽快感を表現したグミです。青い色が特徴的で、さっぱりとした味わいです。',
    price: 180,
    category: 'gummy' as const,
    imageUrl: '/images/soda-gummy.jpg',
    stock: 40,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'candy-001',
    name: 'いちごミルクキャンディ',
    description: '濃厚ないちごミルクの味わいが楽しめるキャンディです。口の中でゆっくり溶けていきます。',
    price: 200,
    category: 'candy' as const,
    imageUrl: '/images/strawberry-milk-candy.jpg',
    stock: 35,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'candy-002',
    name: 'のど飴 ハニーレモン',
    description: 'はちみつとレモンの組み合わせで、のどに優しいキャンディです。風邪の季節におすすめ。',
    price: 250,
    category: 'candy' as const,
    imageUrl: '/images/honey-lemon-candy.jpg',
    stock: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'candy-003',
    name: 'ミントキャンディ',
    description: '爽やかなミントの香りが口の中に広がります。リフレッシュしたい時にぴったり。',
    price: 180,
    category: 'candy' as const,
    imageUrl: '/images/mint-candy.jpg',
    stock: 45,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'candy-004',
    name: 'チョコレートキャンディ',
    description: '濃厚なチョコレートの味わいが楽しめるキャンディです。甘いもの好きにはたまりません。',
    price: 220,
    category: 'candy' as const,
    imageUrl: '/images/chocolate-candy.jpg',
    stock: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'gummy-005',
    name: 'ピーチグミ',
    description: '桃の甘い香りと味わいを再現したグミです。柔らかい食感が特徴です。',
    price: 190,
    category: 'gummy' as const,
    imageUrl: '/images/peach-gummy.jpg',
    stock: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'candy-005',
    name: 'キャラメルキャンディ',
    description: 'バターの風味豊かなキャラメルキャンディです。懐かしい味わいが楽しめます。',
    price: 240,
    category: 'candy' as const,
    imageUrl: '/images/caramel-candy.jpg',
    stock: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// データベースに初期データを投入する関数
export const seedDatabase = async () => {
  const { productService, initDB } = await import('./indexeddb')
  
  try {
    await initDB()
    
    // 既存の商品があるかチェック
    const existingProducts = await productService.getAll()
    
    if (existingProducts.length === 0) {
      // 商品が存在しない場合のみサンプルデータを投入
      for (const product of sampleProducts) {
        await productService.add(product)
      }
      console.log('サンプル商品データを投入しました')
      return true
    } else {
      console.log('既に商品データが存在します')
      return false
    }
  } catch (error) {
    console.error('データベースの初期化に失敗しました:', error)
    throw error
  }
}