import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: 'AI 보안 로그 분석기',
  description:
    '보안 로그를 입력하면 AI가 공격 유형과 위험도를 분석하는 프론트엔드 데모 대시보드입니다.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fcf9f2',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      className={`light bg-background ${inter.variable} ${jetbrainsMono.variable}`}
    >
      {/* SEC-OPS Terminal 테마: 전체를 JetBrains Mono로 통일 (docs/디자인.md) */}
      <body className="font-mono antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
