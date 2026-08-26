'use client'

import {
  ShieldQuestion,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database,
  Code2,
  KeyRound,
  FolderTree,
  ShieldCheck,
  HelpCircle,
  ListChecks,
  FileSearch,
  type LucideIcon,
} from 'lucide-react'
import { RiskBadge } from '@/components/risk-badge'
import type { AnalysisResult, AnalysisStatus, AttackType } from '@/lib/analyze'

const SUPPORTED_TYPES = [
  'SQL Injection',
  'XSS',
  'Brute Force',
  'Path Traversal',
  '정상 요청',
  '판단 불가',
]

const ATTACK_ICON: Record<AttackType, LucideIcon> = {
  'SQL Injection': Database,
  XSS: Code2,
  'Brute Force': KeyRound,
  'Path Traversal': FolderTree,
  '정상 요청': ShieldCheck,
  '판단 불가': HelpCircle,
}

interface AnalysisResultPanelProps {
  status: AnalysisStatus
  result: AnalysisResult | null
  onRetry: () => void
}

export function AnalysisResultPanel({
  status,
  result,
  onRetry,
}: AnalysisResultPanelProps) {
  return (
    <section
      className="flex min-h-[520px] flex-col rounded-xl border border-border bg-card"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 border-b border-border p-5">
        <FileSearch className="size-5 text-primary" aria-hidden="true" />
        <h3 className="text-base font-semibold text-foreground">AI 분석 결과</h3>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {status === 'idle' && <IdleState />}
        {status === 'analyzing' && <AnalyzingState />}
        {status === 'error' && <ErrorState onRetry={onRetry} />}
        {status === 'success' && result && <SuccessState result={result} />}
      </div>
    </section>
  )
}

function IdleState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-full border border-border bg-secondary text-primary">
        <ShieldQuestion className="size-8" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h4 className="text-lg font-semibold text-foreground">
          분석 결과가 여기에 표시됩니다
        </h4>
        <p className="text-sm text-muted-foreground">
          왼쪽에 로그를 입력하고 분석 버튼을 눌러주세요.
        </p>
      </div>
      <div className="w-full max-w-sm">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          지원 공격 유형
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {SUPPORTED_TYPES.map((type) => (
            <li
              key={type}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
            >
              {type}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function AnalyzingState() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col items-center justify-center gap-3 pt-4 text-center">
        <Loader2
          className="size-10 animate-spin text-primary"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1">
          <h4 className="text-lg font-semibold text-foreground">
            로그를 분석하고 있습니다
          </h4>
          <p className="text-sm text-muted-foreground">
            공격 패턴과 위험도를 확인하는 중입니다.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3" aria-hidden="true">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 animate-pulse rounded-lg bg-secondary" />
          <div className="h-20 animate-pulse rounded-lg bg-secondary" />
        </div>
        <div className="h-24 animate-pulse rounded-lg bg-secondary" />
        <div className="h-16 animate-pulse rounded-lg bg-secondary" />
      </div>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center"
    >
      <div className="flex size-16 items-center justify-center rounded-full border border-destructive/40 bg-destructive/15 text-destructive">
        <AlertTriangle className="size-8" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h4 className="text-lg font-semibold text-foreground">
          분석에 실패했습니다
        </h4>
        <p className="text-sm text-muted-foreground">잠시 후 다시 시도해주세요.</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        다시 시도
      </button>
    </div>
  )
}

function SuccessState({ result }: { result: AnalysisResult }) {
  const AttackIcon = ATTACK_ICON[result.attackType]
  return (
    <div className="flex flex-col gap-5">
      {/* 요약 헤더 */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/10 p-4">
        <CheckCircle2
          className="mt-0.5 size-6 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold text-foreground">분석 완료</p>
          <p className="text-sm text-muted-foreground">
            로그 {result.lineCount}줄 분석 · 처리 시간 {result.processingTime}
          </p>
        </div>
      </div>

      {/* 공격 유형 + 위험도 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground">공격 유형</p>
          <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <AttackIcon className="size-5 text-primary" aria-hidden="true" />
            {result.attackType}
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground">위험도</p>
          <div>
            <RiskBadge risk={result.risk} />
          </div>
        </div>
      </div>

      {/* 분석 설명 */}
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">분석 설명</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {result.description}
        </p>
      </div>

      {/* 탐지 근거 */}
      <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-background p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ListChecks className="size-4 text-primary" aria-hidden="true" />
          탐지 근거
        </p>
        <ul className="flex flex-col gap-2">
          {result.evidence.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
            >
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* 권장 확인 사항 */}
      <div className="flex flex-col gap-2.5 rounded-lg border border-risk-medium/40 bg-risk-medium/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-risk-medium">
          <AlertTriangle className="size-4" aria-hidden="true" />
          권장 확인 사항
        </p>
        <ul className="flex flex-col gap-1.5">
          {result.recommendations.map((item) => (
            <li
              key={item}
              className="flex gap-2 text-sm leading-relaxed text-foreground/80"
            >
              <span aria-hidden="true">·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
