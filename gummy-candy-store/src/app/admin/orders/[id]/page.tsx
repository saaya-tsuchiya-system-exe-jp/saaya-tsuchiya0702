import AdminOrderDetailClient from './AdminOrderDetailClient'

// 静的パラメータを生成（サンプル注文IDを生成）
export async function generateStaticParams() {
  // サンプル注文IDを生成
  return [
    { id: 'sample-order-1' },
    { id: 'sample-order-2' },
    { id: 'sample-order-3' },
  ]
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminOrderDetailClient params={params} />
}