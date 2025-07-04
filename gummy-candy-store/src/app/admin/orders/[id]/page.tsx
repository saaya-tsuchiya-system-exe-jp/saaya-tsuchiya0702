import AdminOrderDetailClient from './AdminOrderDetailClient'

// 静的パラメータを生成（注文は動的に作成されるため空の配列を返す）
export async function generateStaticParams() {
  return []
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminOrderDetailClient params={params} />
}