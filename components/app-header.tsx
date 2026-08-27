import { ShieldHalf, Info } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="flex flex-col gap-4 border-b-2 border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border-2 border-primary/30 bg-primary/10 text-primary">
          <ShieldHalf className="size-6" aria-hidden="true" />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-lg font-bold text-foreground sm:text-xl">
            AI 보안 로그 분석기
          </h1>
          <span className="rounded-none border-2 border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Frontend Demo
          </span>
        </div>
      </div>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="size-4 shrink-0" aria-hidden="true" />
        AI 분석 결과는 참고용입니다
      </p>
    </header>
  )
}
