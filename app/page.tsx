'use client'

import { useRef, useState } from 'react'
import { AppHeader } from '@/components/app-header'
import { IntroSection } from '@/components/intro-section'
import { LogInputPanel } from '@/components/log-input-panel'
import { AnalysisResultPanel } from '@/components/analysis-result-panel'
import {
  analyzeLog,
  clampToMaxLines,
  countLines,
  type AnalysisResult,
  type AnalysisStatus,
  type PresetLog,
} from '@/lib/analyze'

export default function Page() {
  const [log, setLog] = useState('')
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [overflowNotice, setOverflowNotice] = useState(false)
  const [emptyNotice, setEmptyNotice] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 오류 테스트 버튼이 눌렸는지 여부를 추적 (다시 시도 시 정상 분석)
  const forceErrorRef = useRef(false)

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

  // 분석 시뮬레이션: setTimeout으로 약 1.2초 지연 후 결과 표시
  function runAnalysis(forceError: boolean) {
    if (log.trim() === '') {
      setEmptyNotice(true)
      return
    }
    setEmptyNotice(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    forceErrorRef.current = forceError
    setStatus('analyzing')

    timerRef.current = setTimeout(() => {
      if (forceErrorRef.current) {
        // 오류 상태에서는 이전 정상 결과를 덮어쓰지 않고 에러 상태 표시 (E-03)
        setStatus('error')
      } else {
        setResult(analyzeLog(log))
        setStatus('success')
      }
    }, 1200)
  }

  function handleAnalyze() {
    runAnalysis(false)
  }

  function handleRetry() {
    // 입력 로그를 유지한 채 정상 분석 재수행 (E-03)
    runAnalysis(false)
  }

  function handleReset() {
    // 모든 상태 초기화 (F-07, E-09)
    if (timerRef.current) clearTimeout(timerRef.current)
    forceErrorRef.current = false
    setLog('')
    setResult(null)
    setOverflowNotice(false)
    setEmptyNotice(false)
    setStatus('idle')
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
            onRetry={handleRetry}
          />
        </main>

        {/* 오류 상태 테스트 버튼 (E-03 / E-04 예외 케이스 검증용) */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => runAnalysis(true)}
            disabled={log.trim() === '' || status === 'analyzing'}
            className="min-h-9 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            [테스트용] 인위적 분석 오류 발생 유발
          </button>
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
              'Frontend Prototype',
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
