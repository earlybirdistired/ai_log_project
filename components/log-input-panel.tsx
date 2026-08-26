'use client'

import { useState } from 'react'
import {
  Terminal,
  ScanSearch,
  RotateCcw,
  FileCode2,
  Loader2,
  ChevronDown,
  AlertCircle,
} from 'lucide-react'
import {
  MAX_LINES,
  PRESET_LOGS,
  type AnalysisStatus,
  type PresetLog,
} from '@/lib/analyze'

interface LogInputPanelProps {
  value: string
  lineCount: number
  overflowNotice: boolean
  emptyNotice: boolean
  status: AnalysisStatus
  onChange: (value: string) => void
  onAnalyze: () => void
  onReset: () => void
  onSelectPreset: (preset: PresetLog) => void
}

export function LogInputPanel({
  value,
  lineCount,
  overflowNotice,
  emptyNotice,
  status,
  onChange,
  onAnalyze,
  onReset,
  onSelectPreset,
}: LogInputPanelProps) {
  const [showPresets, setShowPresets] = useState(false)
  const isAnalyzing = status === 'analyzing'

  // 줄 수 표시 색상: 80줄 이상 주의, 100줄 도달 시 경고
  const countColor =
    lineCount >= MAX_LINES
      ? 'text-risk-high font-semibold'
      : lineCount >= 80
        ? 'text-risk-medium'
        : 'text-muted-foreground'

  return (
    <section className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-1 border-b border-border p-5">
        <div className="flex items-center gap-2">
          <Terminal className="size-5 text-primary" aria-hidden="true" />
          <h3 className="text-base font-semibold text-foreground">
            보안 로그 입력
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          분석할 웹 서버 로그를 입력하세요. (최대 {MAX_LINES}줄)
        </p>
      </div>

      <div className="flex flex-col gap-3.5 p-5">
        {/* 상단 컨트롤 바 (라벨 및 프리셋 선택) */}
        <div className="relative flex items-center justify-between">
          <label
            htmlFor="log-input"
            className="text-sm font-medium text-foreground"
          >
            로그 텍스트
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresets((prev) => !prev)}
              disabled={isAnalyzing}
              aria-expanded={showPresets}
              aria-haspopup="listbox"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileCode2 className="size-3.5 text-primary" aria-hidden="true" />
              <span>테스트 예시 로그 선택</span>
              <ChevronDown className="size-3 text-muted-foreground" aria-hidden="true" />
            </button>

            {/* 프리셋 드롭다운 메뉴 */}
            {showPresets && (
              <div
                role="listbox"
                className="absolute right-0 top-full z-20 mt-1 w-64 rounded-lg border border-border bg-popover p-1.5 shadow-lg animate-in fade-in-50 zoom-in-95"
              >
                <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">
                  테스트 케이스 샘플
                </div>
                {PRESET_LOGS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => {
                      onSelectPreset(preset)
                      setShowPresets(false)
                    }}
                    className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs text-popover-foreground transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                  >
                    <span className="font-medium">{preset.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {preset.attackType}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 텍스트 영역 */}
        <textarea
          id="log-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isAnalyzing}
          spellCheck={false}
          aria-describedby="line-count line-help"
          placeholder={`# 예시 로그 (직접 입력하거나 상단에서 예시를 선택하세요)
192.168.0.15 - - [26/Aug/2026:10:12:31 +0900] "GET /login HTTP/1.1" 200 1240
203.0.113.25 - - [26/Aug/2026:10:13:04 +0900] "POST /login HTTP/1.1" 401 532
198.51.100.17 - - [26/Aug/2026:10:14:22 +0900] "GET /search?q=' OR 1=1-- HTTP/1.1" 500 821`}
          className="min-h-[380px] w-full resize-y overflow-auto rounded-lg border border-input bg-background p-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary disabled:opacity-60"
        />

        {/* 줄 수 카운터 및 안내 (PRD 3.2 ②, F-01 명세 충족: 현재 X / 100줄) */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <p id="line-help" className="text-xs text-muted-foreground">
            로그는 최대 {MAX_LINES}줄까지 입력할 수 있습니다.
          </p>
          <p
            id="line-count"
            className={`text-right text-sm tabular-nums ${countColor}`}
          >
            현재 {lineCount} / {MAX_LINES}줄
          </p>
        </div>

        {/* E-01: 빈 입력 에러 메시지 */}
        {emptyNotice && (
          <p
            role="alert"
            className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <span>분석할 로그를 입력해주세요.</span>
          </p>
        )}

        {/* E-02: 100줄 초과 경고 메시지 */}
        {overflowNotice && (
          <p
            role="alert"
            className="flex items-center gap-1.5 rounded-md border border-risk-high/40 bg-risk-high/10 px-3 py-2 text-sm text-risk-high"
          >
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <span>로그는 최대 {MAX_LINES}줄까지 입력할 수 있습니다. 초과된 내용은 제한되었습니다.</span>
          </p>
        )}

        {/* 실행 액션 버튼 영역 */}
        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span>로그를 분석하고 있습니다...</span>
              </>
            ) : (
              <>
                <ScanSearch className="size-4" aria-hidden="true" />
                <span>로그 분석하기</span>
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
            <span>초기화</span>
          </button>
        </div>
      </div>
    </section>
  )
}
