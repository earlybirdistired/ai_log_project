import { NextResponse } from 'next/server'
import {
  analyzeLog,
  clampToMaxLines,
  countLines,
  MAX_LINES,
} from '@/lib/analyze'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { log, forceError } = body

    // 1. 강제 오류 테스트 플래그 처리 (E-03 / E-04 검증용)
    if (forceError) {
      return NextResponse.json(
        {
          success: false,
          error: '분석에 실패했습니다. 잠시 후 다시 시도해주세요.',
          code: 'AI_SERVICE_ERROR',
        },
        { status: 500 }
      )
    }

    // 2. 빈 입력 유효성 검사 (E-01)
    if (!log || typeof log !== 'string' || log.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: '분석할 로그를 입력해주세요.',
          code: 'EMPTY_LOG',
        },
        { status: 400 }
      )
    }

    // 3. 줄 수 제한 검사 및 클램핑 (F-01, E-02)
    const lineCount = countLines(log)
    const processedLog = lineCount > MAX_LINES ? clampToMaxLines(log, MAX_LINES) : log

    // 4. 비동기 분석 처리 시뮬레이션 지연 (1~1.5초)
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500))

    // 5. 분석 엔진 수행 (F-02, F-03, F-04, F-05)
    const analysisResult = analyzeLog(processedLog)

    return NextResponse.json({
      success: true,
      data: analysisResult,
    })
  } catch (error) {
    console.error('API /api/analyze error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '분석 결과를 처리할 수 없습니다. 다시 시도해주세요.',
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    )
  }
}
