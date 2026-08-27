'use client'

import { useRef, useState } from 'react'
import { AppHeader } from '@/components/app-header'
import { IntroSection } from '@/components/intro-section'
import { LogInputPanel } from '@/components/log-input-panel'
import { AnalysisResultPanel } from '@/components/analysis-result-panel'
import {
  clampToMaxLines,
  countLines,
  ERROR_MESSAGES,
  isValidAnalysisResult,
  type AnalysisErrorInfo,
  type AnalysisErrorType,
  type AnalysisHistoryEntry,
  type AnalysisResult,
  type AnalysisStatus,
  type PresetLog,
} from '@/lib/analyze'

// Sprint 10: 세션 내 최근 분석 히스토리를 몇 건까지 컨텍스트로 넘길지
const HISTORY_LIMIT = 3

export default function Page() {
  const [log, setLog] = useState('')
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [previousResult, setPreviousResult] = useState<AnalysisResult | null>(null)
  const [errorInfo, setErrorInfo] = useState<AnalysisErrorInfo | null>(null)
  const [overflowNotice, setOverflowNotice] = useState(false)
  const [emptyNotice, setEmptyNotice] = useState(false)
  // Sprint 10: DB/localStorage에 저장하지 않는 순수 세션 메모리(React 상태).
  // 새로고침하면 사라지며, PRD가 제외한 "분석 기록 저장"에 해당하지 않는다.
  const [history, setHistory] = useState<AnalysisHistoryEntry[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  const lineCount = countLines(log)

  function handleChange(value: string) {
    const clamped = clampToMaxLines(value)
    setOverflowNotice(clamped !== value)
    setLog(clamped)
    if (clamped.trim() !== '') {
      setEmptyNotice(false)
    }
  }

  function handleSelectPreset(preset: PresetLog) {
    const clamped = clampToMaxLines(preset.log)
    setLog(clamped)
    setOverflowNotice(false)
    setEmptyNotice(false)
  }

  // 실제 API Route 호출을 통한 비동기 분석 수행 (F-02, E-01 ~ E-09)
  async function runAnalysis(forceType?: 'service' | 'malformed' | 'network') {
    // E-01: 빈 로그 입력 시 분석 요청 차단
    if (log.trim() === '') {
      setEmptyNotice(true)
      return
    }
    setEmptyNotice(false)

    // E-08: 중복 요청 방지 - 이미 분석 중인 경우 추가 요청 차단
    if (status === 'analyzing' && !forceType) {
      return
    }

    // E-04: 오프라인 상태 또는 네트워크 강제 에러 시뮬레이션
    if (forceType === 'network' || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      if (result) {
        setPreviousResult(result)
      }
      setErrorInfo({
        type: 'NETWORK_ERROR',
        ...ERROR_MESSAGES.NETWORK_ERROR,
      })
      setStatus('error')
      return
    }

    // 이전 요청 취소 및 새 AbortController 설정
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    // Sprint 6: 서버가 응답 없이 멈추는 경우를 대비한 클라이언트측 안전장치.
    // 서버 1차 시도의 최대 타임아웃이 45초이므로, 네트워크 왕복 시간을 감안해
    // 그보다 여유를 둔 55초를 넘기면 강제로 요청을 종료한다.
    let timedOut = false
    const CLIENT_TIMEOUT_MS = 55_000
    const timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, CLIENT_TIMEOUT_MS)

    // 분석 진행 전 기존 성공 결과를 previousResult로 백업 (E-03 대응: 실패 시 보존)
    if (result) {
      setPreviousResult(result)
    }

    setStatus('analyzing')
    setErrorInfo(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          log,
          forceErrorType: forceType,
          history: history.slice(-HISTORY_LIMIT),
        }),
        signal: controller.signal,
      })

      // E-03: 서버 500 에러 및 API 실패 처리
      if (!response.ok) {
        let errorData: { error?: string; code?: string } = {}
        try {
          errorData = await response.json()
        } catch {
          // JSON 파싱 실패 무시
        }

        setErrorInfo({
          type: 'AI_SERVICE_ERROR',
          title: ERROR_MESSAGES.AI_SERVICE_ERROR.title,
          message: errorData.error || ERROR_MESSAGES.AI_SERVICE_ERROR.message,
        })
        setStatus('error')
        return
      }

      const data = await response.json()

      // E-05: AI 응답 데이터 스키마 유효성 검증
      if (data.success && isValidAnalysisResult(data.data)) {
        setResult(data.data)
        setPreviousResult(null)
        setStatus('success')
        // Sprint 10: 세션 히스토리에 요약만 추가 (최근 HISTORY_LIMIT건 유지)
        setHistory((prev) =>
          [...prev, { attackType: data.data.attackType, risk: data.data.risk }].slice(
            -HISTORY_LIMIT
          )
        )
      } else {
        // 비정상적인 응답 형식
        setErrorInfo({
          type: 'INVALID_RESPONSE',
          ...ERROR_MESSAGES.INVALID_RESPONSE,
        })
        setStatus('error')
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        if (!timedOut) {
          return // 중복 요청으로 인한 취소는 무시
        }
        // Sprint 6: 클라이언트 타임아웃 초과 → 네트워크 오류로 안내
        console.error(`분석 요청이 ${CLIENT_TIMEOUT_MS / 1000}초 내에 응답하지 않아 중단되었습니다.`)
        setErrorInfo({
          type: 'NETWORK_ERROR',
          ...ERROR_MESSAGES.NETWORK_ERROR,
        })
        setStatus('error')
        return
      }

      console.error('분석 요청 실패:', error)

      // E-04 / E-03: 네트워크 오류 또는 서비스 예외
      const isNetworkError =
        (typeof navigator !== 'undefined' && !navigator.onLine) ||
        (error instanceof TypeError && error.message.includes('fetch'))

      const errType: AnalysisErrorType = isNetworkError ? 'NETWORK_ERROR' : 'AI_SERVICE_ERROR'
      setErrorInfo({
        type: errType,
        ...ERROR_MESSAGES[errType],
      })
      setStatus('error')
    } finally {
      clearTimeout(timeoutId)
    }
  }

  function handleAnalyze() {
    runAnalysis()
  }

  function handleRetry() {
    // E-03: 입력 로그를 유지한 채 재시도
    runAnalysis()
  }

  function handleReset() {
    // E-09: 모든 상태 초기화
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setLog('')
    setResult(null)
    setPreviousResult(null)
    setErrorInfo(null)
    setOverflowNotice(false)
    setEmptyNotice(false)
    setStatus('idle')
  }

  // Sprint 10: 세션 히스토리만 별도로 비우기 (입력/결과 초기화와 무관하게
  // 이후 분석에 이전 맥락이 섞이지 않도록 사용자가 직접 끊을 수 있게 함)
  function handleClearHistory() {
    setHistory([])
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* ① 서비스 안내 영역 */}
        <AppHeader />
        <IntroSection />

        {/* ② 로그 입력 영역 & ④ 분석 결과 영역 */}
        <main className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <LogInputPanel
            value={log}
            lineCount={lineCount}
            overflowNotice={overflowNotice}
            emptyNotice={emptyNotice}
            status={status}
            onChange={handleChange}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
            onSelectPreset={handleSelectPreset}
          />
          <AnalysisResultPanel
            status={status}
            result={result}
            errorInfo={errorInfo}
            previousResult={previousResult}
            onRetry={handleRetry}
          />
        </main>

        {/* Sprint 10: 세션 분석 히스토리 (새로고침 시 사라지는 순수 메모리, 저장하지 않음) */}
        {history.length > 0 && (
          <div className="rounded-lg border border-border/70 bg-card/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">
                🕓 이번 세션 분석 히스토리 (최근 {HISTORY_LIMIT}건 · 새로고침 시 사라짐, 저장 안 함)
              </p>
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                히스토리 지우기
              </button>
            </div>
            <ol className="flex flex-wrap gap-2">
              {history.map((entry, i) => (
                <li
                  key={i}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground/80"
                >
                  {i + 1}. {entry.attackType} · {entry.risk}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 예외 처리(E-03, E-04, E-05) 검증용 테스트 액션 바 */}
        <div className="rounded-lg border border-border/70 bg-card/50 p-4 text-center">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            🧪 Sprint 3 예외 처리 시뮬레이션 테스트 바
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => runAnalysis('service')}
              disabled={log.trim() === '' || status === 'analyzing'}
              className="inline-flex min-h-8 items-center rounded-md border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              [E-03] AI 서비스 실패 유발
            </button>
            <button
              type="button"
              onClick={() => runAnalysis('network')}
              disabled={log.trim() === '' || status === 'analyzing'}
              className="inline-flex min-h-8 items-center rounded-md border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              [E-04] 네트워크 오류 유발
            </button>
            <button
              type="button"
              onClick={() => runAnalysis('malformed')}
              disabled={log.trim() === '' || status === 'analyzing'}
              className="inline-flex min-h-8 items-center rounded-md border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              [E-05] 비정상 응답 형식 유발
            </button>
          </div>
        </div>

        {/* 제품 원칙 푸터 */}
        <footer className="flex flex-col gap-3 border-t border-border pt-6">
          <p className="max-w-3xl text-pretty text-sm leading-relaxed text-muted-foreground">
            AI 분석 결과는 보안 학습과 1차 판단을 위한 참고 정보입니다. 실제 공격
            여부와 대응 조치는 추가 로그 및 보안 담당자의 검증 후 수행해야 합니다.
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
            {[
              '로그인 없음',
              '분석 기록 저장 안 함',
              '자동 차단 안 함',
              'Full API Integration',
            ].map((item, i) => (
              <li key={item} className="flex items-center gap-3">
                {i > 0 && (
                  <span aria-hidden="true" className="text-muted-foreground/40">
                    ·
                  </span>
                )}
                {item}
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </div>
  )
}
