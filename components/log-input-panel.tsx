'use client'

import {
  Terminal,
  ScanSearch,
  RotateCcw,
  FileCode2,
  Loader2,
} from 'lucide-react'
import { MAX_LINES, type AnalysisStatus } from '@/lib/analyze'

interface LogInputPanelProps {
  value: string
  lineCount: number
  overflowNotice: boolean
  status: AnalysisStatus
  onChange: (value: string) => void
  onAnalyze: () => void
  onReset: () => void
  onLoadSample: () => void
}

export function LogInputPanel({
  value,
  lineCount,
  overflowNotice,
  status,
  onChange,
  onAnalyze,
  onReset,
  onLoadSample,
}: LogInputPanelProps) {
  const isAnalyzing = status === 'analyzing'
  const isEmpty = value.trim() === ''

  // 줄 수 표시 색상: 80줄 이상 주의, 100줄 위험
  const countColor =
    lineCount >= MAX_LINES
      ? 'text-risk-high'
      : lineCount >= 80
        ? 'text-risk-medium'
        : 'text-muted-foreground'

  return (
    <section className="flex flex-col rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-1 border-b border-border p-5">
        <div className="flex items-center gap-2">
          <Terminal className="size-5 text-primary" aria-hidden="true" />
          <h3 className="text-base font-semibold text-foreground">
            보안 로그 입력
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          분석할 웹 서버 로그를 입력하세요.
        </p>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="log-input"
            className="text-sm font-medium text-foreground"
          >
            로그 텍스트
          </label>
          <button
            type="button"
            onClick={onLoadSample}
            disabled={isAnalyzing}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileCode2 className="size-4" aria-hidden="true" />
            예시 로그 불러오기
          </button>
        </div>

        <textarea
          id="log-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isAnalyzing}
          spellCheck={false}
          aria-describedby="line-count line-help"
          placeholder={`192.168.0.15 - - [26/Aug/2026:10:12:31 +0900] "GET /login HTTP/1.1" 200 1240
203.0.113.25 - - [26/Aug/2026:10:13:04 +0900] "POST /login HTTP/1.1" 401 532
198.51.100.17 - - [26/Aug/2026:10:14:22 +0900] "GET /search?q=' OR 1=1-- HTTP/1.1" 500 821`}
          className="min-h-[380px] w-full resize-y overflow-auto rounded-lg border border-input bg-background p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:opacity-60"
        />

        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <p id="line-help" className="text-xs text-muted-foreground">
            로그는 최대 {MAX_LINES}줄까지 입력할 수 있습니다.
          </p>
          <p
            id="line-count"
            className={`text-right text-sm font-medium tabular-nums ${countColor}`}
          >
            {lineCount} / {MAX_LINES}줄
          </p>
        </div>

        {overflowNotice && (
          <p
            role="alert"
            className="rounded-md border border-risk-high/40 bg-risk-high/10 px-3 py-2 text-sm text-risk-high"
          >
            로그는 최대 {MAX_LINES}줄까지 입력할 수 있습니다. 초과된 내용은
            입력되지 않았습니다.
          </p>
        )}

        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isEmpty || isAnalyzing}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                분석 중...
              </>
            ) : (
              <>
                <ScanSearch className="size-4" aria-hidden="true" />
                로그 분석하기
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={isAnalyzing}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            초기화
          </button>
        </div>
      </div>
    </section>
  )
}
