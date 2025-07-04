import type { Metadata } from 'next'
import AdminSidebar from '@/components/AdminSidebar'
import InitializeData from '@/components/InitializeData'

export const metadata: Metadata = {
  title: 'グミ・あめストア - 管理画面',
  description: 'グミ・あめストアの管理画面',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-semibold text-gray-900">管理画面</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">管理者</span>
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <InitializeData />
    </div>
  )
}