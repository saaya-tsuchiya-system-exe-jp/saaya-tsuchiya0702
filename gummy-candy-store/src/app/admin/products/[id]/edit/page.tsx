import { sampleProducts } from '@/lib/sampleData'
import AdminProductEditClient from './AdminProductEditClient'

// 静的パラメータを生成
export async function generateStaticParams() {
  return sampleProducts.map((product) => ({
    id: product.id,
  }))
}

export default function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminProductEditClient params={params} />
}