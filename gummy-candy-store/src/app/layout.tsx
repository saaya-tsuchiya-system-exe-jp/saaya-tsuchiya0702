import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: {
    default: "グミ・あめストア - 美味しいグミとあめの通販サイト",
    template: "%s | グミ・あめストア"
  },
  description: "美味しいグミとあめを豊富に取り揃えた通販サイト。ハリボーから国産グミまで、厳選された商品をお届けします。",
  keywords: ["グミ", "あめ", "キャンディ", "通販", "お菓子", "スイーツ"],
  authors: [{ name: "グミ・あめストア" }],
  creator: "グミ・あめストア",
  publisher: "グミ・あめストア",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gummy-candy-store.example.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "グミ・あめストア - 美味しいグミとあめの通販サイト",
    description: "美味しいグミとあめを豊富に取り揃えた通販サイト。ハリボーから国産グミまで、厳選された商品をお届けします。",
    url: 'https://gummy-candy-store.example.com',
    siteName: 'グミ・あめストア',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "グミ・あめストア - 美味しいグミとあめの通販サイト",
    description: "美味しいグミとあめを豊富に取り揃えた通販サイト。ハリボーから国産グミまで、厳選された商品をお届けします。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <footer className="bg-gray-800 text-white py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <p>&copy; 2024 グミ・あめストア. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
