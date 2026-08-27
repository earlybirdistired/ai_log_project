'use client'

import { useEffect, useState } from 'react'
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
import type {
  AnalysisErrorInfo,
  AnalysisResult,
  AnalysisStatus,
  AttackType,
} from '@/lib/analyze'

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
  errorInfo: AnalysisErrorInfo | null
  previousResult: AnalysisResult | null
  onRetry: () => void
}

export function AnalysisResultPanel({
  status,
  result,
  errorInfo,
  previousResult,
  onRetry,
}: AnalysisResultPanelProps) {
  return (
    <section
      className="flex min-h-[520px] flex-col border-2 border-primary bg-card"
      aria-live="polite"
    >
      <div className="flex items-center justify-between border-b-2 border-border p-5">
        <div className="flex items-center gap-2">
          <FileSearch className="size-5 text-primary" aria-hidden="true" />
          <h3 className="text-base font-semibold text-foreground">AI 분석 결과</h3>
        </div>
        {status === 'error' && previousResult && (
          <span className="rounded-none bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
            이전 정상 결과 보존됨
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {status === 'idle' && <IdleState />}
        {status === 'analyzing' && <AnalyzingState />}
        {status === 'error' && (
          <ErrorState
            errorInfo={errorInfo}
            previousResult={previousResult}
            onRetry={onRetry}
          />
        )}
        {status === 'success' && result && <SuccessState result={result} />}
      </div>
    </section>
  )
}

function IdleState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-none border-2 border-border bg-secondary text-primary">
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
              className="rounded-md border-2 border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
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

function ErrorState({
  errorInfo,
  previousResult,
  onRetry,
}: {
  errorInfo: AnalysisErrorInfo | null
  previousResult: AnalysisResult | null
  onRetry: () => void
}) {
  const isNetwork = errorInfo?.type === 'NETWORK_ERROR'
  const title = errorInfo?.title || '분석에 실패했습니다'
  const message =
    errorInfo?.message || '분석에 실패했습니다. 잠시 후 다시 시도해주세요.'

  return (
    <div className="flex flex-1 flex-col gap-6 py-4">
      <div
        role="alert"
        className="flex flex-col items-center justify-center gap-4 text-center"
      >
        <div className="flex size-16 items-center justify-center rounded-none border-2 border-destructive/40 bg-destructive/15 text-destructive">
          <AlertTriangle className="size-8" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h4 className="text-lg font-semibold text-foreground">{title}</h4>
          <p className="max-w-md text-sm text-muted-foreground">{message}</p>
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

      {/* E-03: 실패 시 이전 정상 결과가 덮어써지지 않고 보존된 내역 표시 */}
      {previousResult && (
        <div className="mt-2 rounded-lg border-2 border-border/80 bg-background/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              📋 이전 정상 분석 결과 (보존됨)
            </span>
            <RiskBadge risk={previousResult.risk} />
          </div>
          <div className="space-y-1.5 text-xs text-foreground/80">
            <p>
              <strong className="text-foreground">공격 유형:</strong>{' '}
              {previousResult.attackType}
            </p>
            <p className="line-clamp-2">
              <strong className="text-foreground">분석 설명:</strong>{' '}
              {previousResult.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Sprint 11: 실시간 타이핑 효과.
// Gemini 응답은 반드시 완전한 JSON으로 검증까지 끝난 뒤에만 화면에 반영해야
// 하므로(스키마 검증 실패 시 E-05 처리), 원시 토큰 스트림을 그대로 흘려보내는
// 방식 대신 "검증이 끝난 최종 설명 텍스트"를 클라이언트에서 타이핑하듯 점진적으로
// 드러내는 방식을 택했다. 서버 안정성(Sprint 6~9에서 다진 타임아웃/재시도/스키마
// 검증)을 건드리지 않으면서 체감 UX만 개선한다.
function useTypewriter(text: string): string {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    setDisplayed('')
    if (!text) return

    const TOTAL_DURATION_MS = 600
    const STEP_MS = 16
    const totalSteps = Math.max(1, Math.round(TOTAL_DURATION_MS / STEP_MS))
    const charsPerStep = Math.max(1, Math.ceil(text.length / totalSteps))

    let shown = 0
    const id = setInterval(() => {
      shown += charsPerStep
      setDisplayed(text.slice(0, shown))
      if (shown >= text.length) {
        clearInterval(id)
      }
    }, STEP_MS)

    return () => clearInterval(id)
  }, [text])

  return displayed
}

function SuccessState({ result }: { result: AnalysisResult }) {
  const AttackIcon = ATTACK_ICON[result.attackType]
  const typedDescription = useTypewriter(result.description)
  return (
    <div className="flex flex-col gap-5 animate-in fade-in-50 duration-300">
      {/* 요약 헤더 */}
      <div className="flex items-start gap-3 rounded-lg border-2 border-primary/25 bg-primary/10 p-4 transition-all">
        <CheckCircle2
          className="mt-0.5 size-6 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold text-foreground">분석 완료</p>
          <p className="text-sm text-muted-foreground">
            로그 {result.lineCount}줄 분석 · 처리 시간 {result.processingTime}
            {result.logFormat && (
              <>
                {' · '}
                <span className="rounded-none bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {result.logFormat}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* 공격 유형 + 위험도 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-lg border-2 border-border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground">공격 유형</p>
          <p className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <AttackIcon className="size-5 text-primary" aria-hidden="true" />
            {result.attackType}
          </p>
          {result.secondaryAttackTypes && result.secondaryAttackTypes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">복합 패턴:</span>
              {result.secondaryAttackTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-none border-2 border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 rounded-lg border-2 border-border bg-background p-4">
          <p className="text-xs font-medium text-muted-foreground">위험도</p>
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge risk={result.risk} />
            {result.confidence && (
              <span
                className="rounded-none border-2 border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                title="AI가 스스로 판단한 분석 확신도"
              >
                확신도 {result.confidence}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 분석 설명 (타이핑 효과) */}
      <div className="flex flex-col gap-2 rounded-lg border-2 border-border bg-background p-4">
        <p className="text-sm font-semibold text-foreground">분석 설명</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {typedDescription}
          {typedDescription.length < result.description.length && (
            <span
              className="ml-0.5 inline-block h-3.5 w-[2px] animate-[pulse_1s_infinite] bg-primary align-middle"
              aria-hidden="true"
            />
          )}
        </p>
      </div>

      {/* 탐지 근거 */}
      <div className="flex flex-col gap-2.5 rounded-lg border-2 border-border bg-background p-4">
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
                className="mt-2 size-1.5 shrink-0 rounded-none bg-primary"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* 권장 확인 사항 */}
      <div className="flex flex-col gap-2.5 rounded-lg border-2 border-risk-medium/40 bg-risk-medium/10 p-4">
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
