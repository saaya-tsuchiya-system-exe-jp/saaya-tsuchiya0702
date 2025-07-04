'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ClipboardDocumentListIcon,
  CubeIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'ダッシュボード', href: '/admin', icon: HomeIcon },
  { name: '商品管理', href: '/admin/products', icon: ShoppingBagIcon },
  { name: '注文管理', href: '/admin/orders', icon: ClipboardDocumentListIcon },
  { name: '在庫管理', href: '/admin/inventory', icon: CubeIcon },
  { name: '統計・レポート', href: '/admin/analytics', icon: ChartBarIcon },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-gray-800">
      <div className="flex items-center h-16 px-4 bg-gray-900">
        <h1 className="text-xl font-semibold text-white">管理画面</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md
                ${isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-6 w-6 flex-shrink-0
                  ${isActive ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'}
                `}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="flex-shrink-0 p-4">
        <Link
          href="/"
          className="group flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
        >
          <ArrowLeftOnRectangleIcon
            className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-300"
            aria-hidden="true"
          />
          サイトに戻る
        </Link>
      </div>
    </div>
  )
}