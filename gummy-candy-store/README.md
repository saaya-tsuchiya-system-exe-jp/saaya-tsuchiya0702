# グミ・あめストア 🍬

美味しいグミとあめを豊富に取り揃えた通販サイトです。Amazonのような本格的なECサイトの機能を実装しています。

## 🌟 主な機能

### 🛍️ ショッピング機能
- **商品一覧・詳細表示**: カテゴリ別の商品表示と詳細情報
- **ショッピングカート**: 商品の追加・削除・数量変更
- **商品検索**: テキスト検索とフィルター機能
- **注文処理**: 注文確認から完了まで

### 👤 ユーザー機能
- **ユーザー認証**: ログイン・ログアウト・新規登録
- **マイページ**: ユーザー情報の管理・編集
- **注文履歴**: 過去の注文の確認と詳細表示

### ⭐ レビュー・評価機能
- **商品レビュー**: 星評価とコメント投稿
- **評価統計**: 平均評価と評価分布の表示
- **レビュー管理**: 自分のレビューの編集・削除

### 🔧 管理機能
- **商品管理**: 商品の追加・編集・削除
- **注文管理**: 注文状況の確認と更新
- **在庫管理**: 在庫数の管理
- **分析機能**: 売上データの可視化

### 📱 レスポンシブデザイン
- **モバイル対応**: スマートフォン・タブレットに最適化
- **ダークモード対応**: ユーザーの好みに応じた表示切替

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15.3.4** - React フレームワーク
- **React 19.0.0** - UI ライブラリ
- **TypeScript** - 型安全な開発
- **Tailwind CSS 4** - ユーティリティファーストCSS
- **Heroicons** - アイコンライブラリ

### データベース
- **IndexedDB** - ブラウザ内データベース
- **idb 8.0.3** - IndexedDB ラッパーライブラリ

### UI コンポーネント
- **Material-UI 7.2.0** - React UIコンポーネント
- **Emotion** - CSS-in-JS ライブラリ

### 開発ツール
- **ESLint** - コード品質チェック
- **PostCSS** - CSS 処理ツール

## 🚀 セットアップ手順

### 前提条件
- Node.js 18.0.0 以上
- npm または yarn

### インストール

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd gummy-candy-store
```

2. **依存関係のインストール**
```bash
npm install
# または
yarn install
```

3. **開発サーバーの起動**
```bash
npm run dev
# または
yarn dev
```

4. **ブラウザでアクセス**
```
http://localhost:3000
```

### ビルド

```bash
# 本番用ビルド
npm run build

# 本番サーバー起動
npm run start
```

## 📁 プロジェクト構造

```
gummy-candy-store/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # 管理画面
│   │   ├── cart/              # カートページ
│   │   ├── checkout/          # 注文確認ページ
│   │   ├── login/             # ログインページ
│   │   ├── mypage/            # マイページ
│   │   ├── orders/            # 注文履歴
│   │   ├── products/          # 商品ページ
│   │   ├── register/          # 新規登録ページ
│   │   ├── search/            # 検索ページ
│   │   └── order-complete/    # 注文完了ページ
│   ├── components/            # 再利用可能コンポーネント
│   │   ├── Header.tsx         # ヘッダーコンポーネント
│   │   ├── ProductCard.tsx    # 商品カード
│   │   ├── ReviewSection.tsx  # レビューセクション
│   │   ├── ErrorBoundary.tsx  # エラーハンドリング
│   │   └── LoadingSpinner.tsx # ローディング表示
│   ├── contexts/              # React Context
│   │   ├── AuthContext.tsx    # 認証状態管理
│   │   └── CartContext.tsx    # カート状態管理
│   └── lib/                   # ユーティリティ
│       ├── indexeddb.ts       # データベース操作
│       └── sampleData.ts      # サンプルデータ
├── public/                    # 静的ファイル
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 💾 データベース設計

### テーブル構造

#### products（商品）
- id: 商品ID
- name: 商品名
- description: 商品説明
- price: 価格
- category: カテゴリ（gummy/candy）
- imageUrl: 画像URL
- stock: 在庫数
- createdAt/updatedAt: 作成・更新日時

#### orders（注文）
- id: 注文ID
- customerName: 顧客名
- customerEmail: メールアドレス
- customerPhone: 電話番号
- customerAddress: 配送先住所
- items: 注文商品リスト
- totalAmount: 合計金額
- status: 注文状況
- createdAt/updatedAt: 作成・更新日時

#### cart（カート）
- productId: 商品ID
- quantity: 数量
- addedAt: 追加日時

#### reviews（レビュー）
- id: レビューID
- productId: 商品ID
- userId: ユーザーID
- userName: ユーザー名
- rating: 評価（1-5）
- comment: コメント
- createdAt/updatedAt: 作成・更新日時

## 🎯 主要機能の使い方

### 商品の購入
1. 商品一覧または検索から商品を選択
2. 商品詳細ページで数量を選択してカートに追加
3. カートページで注文内容を確認
4. 注文確認ページで配送先情報を入力
5. 注文完了

### レビューの投稿
1. 商品詳細ページのレビューセクションへ
2. ログイン後「レビューを書く」をクリック
3. 星評価とコメントを入力して投稿

### 管理機能の利用
1. `/admin` にアクセス
2. 商品管理、注文管理、在庫管理、分析機能を利用

## 🔧 カスタマイズ

### テーマの変更
`tailwind.config.js` でカラーパレットを変更できます。

### 新機能の追加
1. `src/app/` に新しいページを追加
2. 必要に応じて `src/components/` にコンポーネントを作成
3. データベーススキーマの変更は `src/lib/indexeddb.ts` で実施

## 🐛 トラブルシューティング

### よくある問題

**Q: データが表示されない**
A: ブラウザの開発者ツールでIndexedDBを確認し、必要に応じてデータベースをクリアしてください。

**Q: ログインできない**
A: デモ版では任意のメールアドレスとパスワード（6文字以上）でログインできます。

**Q: 商品画像が表示されない**
A: 現在はプレースホルダー画像を使用しています。実際の画像を使用する場合は `public/images/` に配置してください。

## 📝 ライセンス

このプロジェクトはデモ目的で作成されています。商用利用の際は適切なライセンスを設定してください。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📞 サポート

質問や問題がある場合は、Issueを作成してください。

---

**注意**: このプロジェクトはデモ版です。実際の決済機能は実装されていません。本番環境で使用する場合は、適切なセキュリティ対策と決済システムの統合が必要です。
