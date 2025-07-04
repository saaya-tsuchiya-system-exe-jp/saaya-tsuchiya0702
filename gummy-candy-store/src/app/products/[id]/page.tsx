import { sampleProducts } from '@/lib/sampleData'
import ProductDetailClient from './ProductDetailClient'

// 静的パラメータを生成
export async function generateStaticParams() {
  return sampleProducts.map((product) => ({
    id: product.id,
  }))
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return <ProductDetailClient params={params} />
}