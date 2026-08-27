import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import {
  clampToMaxLines,
  countLines,
  isValidAnalysisResult,
  MAX_LINES,
  VALID_ATTACK_TYPES,
  VALID_CONFIDENCE_LEVELS,
  VALID_RISK_LEVELS,
  type AttackType,
  type ConfidenceLevel,
  type RiskLevel,
} from '@/lib/analyze'

// ─────────────────────────────────────────────────────────────
// Gemini AI 클라이언트 초기화 (서버사이드 전용)
// .env 파일에서 GEMINI_API_KEY 로드 (process.env 서버사이드 접근)
// ─────────────────────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

// gemini-3.6-flash는 무료 등급 일일 할당량이 20건으로 매우 낮아 실사용에
// 부적합함을 확인했다(RESOURCE_EXHAUSTED, quotaId: ...PerDay...-FreeTier).
// gemini-3.5-flash-lite는 별도 할당량 풀을 사용하고, 내부 reasoning
// 오버헤드가 없어 응답이 빠르고 안정적이다(실측 1.5~2초). 모델명은
// 환경변수로 교체 가능하게 하여 유료 등급 전환 시 gemini-3.6-flash 등으로
// 손쉽게 되돌릴 수 있도록 한다.
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'

// ─────────────────────────────────────────────────────────────
// 시스템 프롬프트 (분석 엔진 역할 및 응답 형식 규정)
// ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `당신은 웹/서버 보안 로그 분석 전문가입니다.
사용자가 입력한 보안 로그를 분석하여 아래 JSON 형식으로만 응답하세요.

반드시 지켜야 할 규칙:
0. 분석에 앞서 로그의 형식을 먼저 판별하세요. logFormat은 다음 중 가장 가까운 하나입니다:
   - "SSH 인증 로그": sshd, Failed password, Accepted password 등 SSH 데몬 로그
   - "Apache/Nginx 액세스 로그": Combined/Common 로그 포맷 ("GET/POST ... HTTP/1.1" 상태코드 등)
   - "Windows 이벤트 로그": EventID, 로그온 유형 등 윈도우 이벤트 뷰어 형식
   - "애플리케이션/디버그 로그": INFO/DEBUG/ERROR 등 애플리케이션 자체 로그
   - "알 수 없음": 위 어디에도 해당하지 않거나 형식이 불분명한 경우
   판별한 형식에 맞춰 description과 evidence를 해당 포맷의 필드(IP, 포트, 이벤트 ID, HTTP 상태코드 등)를 근거로 구체적으로 작성하세요.

1. attackType은 반드시 아래 6가지 중 하나입니다:
   - "SQL Injection": SQL 구문 삽입 패턴 (UNION SELECT, OR 1=1, DROP TABLE 등)
   - "XSS": 스크립트 삽입 패턴 (<script>, onerror=, javascript: 등)
   - "Brute Force": 동일 IP/계정의 반복 인증 실패 (SSH, HTTP 401, 로그인 시도 등)
   - "Path Traversal": 상위 디렉터리 접근 패턴 (../, %2e%2e, /etc/passwd 등)
   - "정상 요청": 명백한 공격 패턴 없는 정상 트래픽
   - "판단 불가": 로그가 불충분하거나 모호한 경우

2. risk는 반드시 아래 5가지 중 하나입니다:
   - "치명적": 시스템 침투/DB 탈취 등 즉각적 피해 가능
   - "높음": 인증 우회/주요 취약점 공격 시도
   - "중간": 무차별 대입/스캐닝 등 지속적 시도
   - "낮음": 정상 요청 또는 경미한 이상
   - "판단 불가": 위험도를 판단하기 어려운 경우

3. evidence는 로그에서 실제로 탐지된 구체적 패턴이나 특징을 3~4개 나열하세요.
   반드시 입력된 로그의 실제 내용(IP, URL, 상태코드, 패턴 등)을 기반으로 작성하세요.

4. recommendations는 이 분석 결과에 맞는 구체적 보안 조치를 2~3개 제시하세요.

5. description은 보안 입문자가 이해할 수 있는 1~2문장의 한국어 설명입니다.
   반드시 실제 로그의 특징을 언급하세요 (예: SSH 로그라면 SSH 관련 내용으로).

6. confidence는 이 판단에 대한 스스로의 확신 정도이며 반드시 아래 3가지 중 하나입니다:
   - "높음": 로그에 해당 공격/정상 패턴의 명확하고 구체적인 근거가 충분함
   - "중간": 유력한 정황은 있으나 일부 정보가 부족하거나 다른 해석의 여지가 있음
   - "낮음": 로그가 단편적이거나 모호하여 추정에 가까움 (attackType이 "판단 불가"인 경우 보통 "낮음")
   과도하게 "높음"을 남발하지 말고, 근거가 빈약하면 정직하게 "중간"/"낮음"으로 표시하세요.

7. secondaryAttackTypes: 로그 안에 attackType(주 공격 유형) 외에 별도로 명확히 구분되는
   다른 공격 패턴이 함께 발견된 경우에만, 그 추가 유형을 0~2개 배열로 나열하세요.
   ("SQL Injection", "XSS", "Brute Force", "Path Traversal" 중에서만 선택하고, attackType과
   동일한 값은 넣지 마세요. 복합 공격이 아니면 반드시 빈 배열 []로 반환하세요.)

8. 사용자 메시지 맨 앞에 "[이전 분석 히스토리]"로 시작하는 참고 정보가 포함될 수 있습니다.
   이는 같은 세션에서 방금 전에 분석했던 다른 로그들의 요약(공격 유형/위험도)입니다.
   현재 로그를 판단할 때 참고만 하고, 현재 로그 자체의 증거에 반하는 결론을 내리지 마세요.
   연관성이 있을 때만(예: 동일한 공격이 반복/확산되는 정황) description에 간단히 언급하세요.

절대로 JSON 외의 텍스트나 마크다운 코드블록(\`\`\`)을 포함하지 마세요.
반드시 아래 스키마를 정확히 따르세요:

{
  "logFormat": "<위 로그 형식 5가지 중 하나>",
  "attackType": "<위 6가지 중 하나>",
  "secondaryAttackTypes": ["<attackType 외 추가로 발견된 공격 유형, 없으면 빈 배열>"],
  "risk": "<위 5가지 중 하나>",
  "confidence": "<위 3가지 중 하나>",
  "description": "<1~2문장 한국어 설명>",
  "evidence": ["<탐지 근거 1>", "<탐지 근거 2>", "<탐지 근거 3>"],
  "recommendations": ["<권장 조치 1>", "<권장 조치 2>"]
}`

// ─────────────────────────────────────────────────────────────
// Sprint 6: 타임아웃 + 재시도 (실측 기반 재설계)
//
// 실측 결과 gemini-3.6-flash는 동일한 짧은 로그에도 정상적으로
// 최대 40초 이상 걸리는 경우가 있었다(정상 완료, finishReason: STOP).
// 즉 "느린 것"과 "멈춘 것"을 구분해야 한다:
//   - 느린 정상 응답을 짧은 타임아웃으로 끊고 재시도하면, 재시도마저
//     같은 이유로 다시 오래 걸려 전체 응답시간만 늘리고 실패 확률만 높인다.
//   - 반면 네트워크 단절/5xx 같은 "즉시 실패"는 재시도할 가치가 있다.
//
// 그래서 1차 시도는 PRD 1분 기준 내에서 여유를 둔 45초까지 기다리고,
// 실패가 아주 빠르게(5초 이내) 발생한 경우에만 일시적 오류로 간주해
// 짧은 예산으로 1회 재시도한다. 45초를 다 채우고도 실패한 경우는
// 재시도하지 않고 바로 상위 catch(E-03)로 넘겨 총 응답시간 상한을 지킨다.
// ─────────────────────────────────────────────────────────────
const PRIMARY_TIMEOUT_MS = 45_000
const FAST_FAIL_THRESHOLD_MS = 5_000
const RETRY_TIMEOUT_MS = 10_000

async function callGeminiWithRetry(processedLog: string, historyContext?: string) {
  const userText = historyContext
    ? `${historyContext}\n\n다음 보안 로그를 분석해주세요:\n\n${processedLog}`
    : `다음 보안 로그를 분석해주세요:\n\n${processedLog}`

  const attempt = (timeoutMs: number) =>
    ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [{ text: userText }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
        maxOutputTokens: 2048,
        thinkingConfig: { thinkingBudget: 256 },
        abortSignal: AbortSignal.timeout(timeoutMs),
      },
    })

  const startedAt = Date.now()
  try {
    return await attempt(PRIMARY_TIMEOUT_MS)
  } catch (err) {
    const elapsed = Date.now() - startedAt
    console.warn(
      `Gemini 1차 호출 실패(${elapsed}ms 경과):`,
      err instanceof Error ? err.message : err
    )

    if (elapsed >= FAST_FAIL_THRESHOLD_MS) {
      // 타임아웃(45초)까지 다 소모하고 실패한 경우: 재시도해도 같은 지연이
      // 반복될 가능성이 높으므로 재시도하지 않고 바로 실패 처리한다.
      throw err
    }

    // 429(RESOURCE_EXHAUSTED, 분당 요청 한도 초과)는 Google이 명시하는
    // 재시도 대기시간이 보통 수십 초로 우리 예산을 넘어서므로, 즉시
    // 재시도해도 다시 실패할 뿐이다. 이 경우는 재시도 없이 바로 실패 처리한다.
    const message = err instanceof Error ? err.message : String(err)
    const isQuotaExceeded = message.includes('RESOURCE_EXHAUSTED') || message.includes('"code":429')
    if (isQuotaExceeded) {
      console.warn('할당량(quota) 초과로 판단 - 재시도 없이 즉시 실패 처리')
      throw err
    }

    console.warn('빠른 실패로 판단 - 일시적 오류(네트워크/일시 과부하)로 간주하고 1회 재시도')
    return await attempt(RETRY_TIMEOUT_MS)
  }
}

// ─────────────────────────────────────────────────────────────
// Sprint 10: 세션 히스토리 → 프롬프트 컨텍스트 문자열 변환
// 클라이언트가 보낸 값은 신뢰하지 않고, 정해진 enum(attackType/risk)에
// 속하는 항목만 최대 3개까지 반영한다.
// ─────────────────────────────────────────────────────────────
function buildHistoryContext(history: unknown): string | undefined {
  if (!Array.isArray(history) || history.length === 0) return undefined

  const validEntries = history
    .filter(
      (h): h is { attackType: AttackType; risk: RiskLevel } =>
        h &&
        typeof h === 'object' &&
        VALID_ATTACK_TYPES.includes((h as Record<string, unknown>).attackType as AttackType) &&
        VALID_RISK_LEVELS.includes((h as Record<string, unknown>).risk as RiskLevel)
    )
    .slice(-3)

  if (validEntries.length === 0) return undefined

  const lines = validEntries
    .map((h, i) => `${i + 1}. 공격 유형: ${h.attackType} / 위험도: ${h.risk}`)
    .join('\n')

  return `[이전 분석 히스토리 - 참고용]\n${lines}`
}

// ─────────────────────────────────────────────────────────────
// Gemini 응답 파싱 및 유효성 검증
// ─────────────────────────────────────────────────────────────
function parseGeminiResponse(text: string): {
  logFormat?: string
  attackType: AttackType
  secondaryAttackTypes?: unknown
  risk: RiskLevel
  confidence?: ConfidenceLevel
  description: string
  evidence: string[]
  recommendations: string[]
} | null {
  try {
    // 마크다운 코드블록 제거 (방어 처리)
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim()

    const parsed = JSON.parse(cleaned)
    return parsed
  } catch {
    // JSON 파싱 실패 시 null 반환 → E-05 처리
    return null
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/analyze
// ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { log, forceErrorType, history } = body

    // ── 강제 오류 시뮬레이션 (Sprint 3 테스트용) ──────────────
    if (forceErrorType === 'malformed') {
      return NextResponse.json({
        success: true,
        data: {
          corrupted: true,
          attackType: 'UnknownAttack',
          risk: 'VeryDangerous',
          description: '',
        },
      })
    }

    if (forceErrorType === 'service') {
      return NextResponse.json(
        {
          success: false,
          error: '분석에 실패했습니다. 잠시 후 다시 시도해주세요.',
          code: 'AI_SERVICE_ERROR',
        },
        { status: 500 }
      )
    }

    // ── E-01: 빈 입력 유효성 검사 ────────────────────────────
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

    // ── API 키 미설정 확인 ────────────────────────────────────
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY가 설정되지 않았습니다.')
      return NextResponse.json(
        {
          success: false,
          error: '분석 서비스가 올바르게 설정되지 않았습니다.',
          code: 'AI_SERVICE_ERROR',
        },
        { status: 500 }
      )
    }

    // ── E-02: 100줄 제한 클램핑 ──────────────────────────────
    const lineCount = countLines(log)
    const processedLog = lineCount > MAX_LINES ? clampToMaxLines(log, MAX_LINES) : log

    // ── Sprint 10: 세션 히스토리 컨텍스트 구성 ────────────────
    // 클라이언트가 보관 중인(서버/DB에 저장하지 않는) 최근 분석 요약을
    // 프롬프트에 참고 정보로만 추가한다. 신뢰할 수 없는 자유 텍스트가
    // 아니라 정해진 enum 값인지 반드시 검증한 뒤에만 사용한다(프롬프트
    // 인젝션 방지).
    const historyContext = buildHistoryContext(history)

    const startTime = Date.now()

    // ── Gemini API 호출 (타임아웃 + 1회 재시도 포함) ──────────
    const response = await callGeminiWithRetry(processedLog, historyContext)

    const rawText = response.text ?? ''
    const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}초`

    // ── E-05: 응답 파싱 및 스키마 유효성 검증 ────────────────
    const parsed = parseGeminiResponse(rawText)

    if (!parsed) {
      console.error('Gemini 응답 파싱 실패:', rawText)
      return NextResponse.json(
        {
          success: false,
          error: '분석 결과를 처리할 수 없습니다. 다시 시도해주세요.',
          code: 'INVALID_RESPONSE',
        },
        { status: 500 }
      )
    }

    const analysisResult = {
      logFormat: typeof parsed.logFormat === 'string' && parsed.logFormat.trim() !== ''
        ? parsed.logFormat
        : undefined,
      attackType: parsed.attackType,
      secondaryAttackTypes: (() => {
        if (!Array.isArray(parsed.secondaryAttackTypes)) return undefined
        const filtered = parsed.secondaryAttackTypes.filter(
          (t): t is AttackType =>
            typeof t === 'string' &&
            VALID_ATTACK_TYPES.includes(t as AttackType) &&
            t !== parsed.attackType &&
            t !== '정상 요청' &&
            t !== '판단 불가'
        )
        return filtered.length > 0 ? filtered : undefined
      })(),
      risk: parsed.risk,
      confidence: VALID_CONFIDENCE_LEVELS.includes(parsed.confidence as ConfidenceLevel)
        ? (parsed.confidence as ConfidenceLevel)
        : undefined,
      description: parsed.description,
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      lineCount: countLines(processedLog),
      processingTime,
    }

    if (!isValidAnalysisResult(analysisResult)) {
      console.error('스키마 유효성 검증 실패:', analysisResult)
      return NextResponse.json(
        {
          success: false,
          error: '분석 결과를 처리할 수 없습니다. 다시 시도해주세요.',
          code: 'INVALID_RESPONSE',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: analysisResult,
    })
  } catch (error) {
    console.error('API /api/analyze error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '분석에 실패했습니다. 잠시 후 다시 시도해주세요.',
        code: 'AI_SERVICE_ERROR',
      },
      { status: 500 }
    )
  }
}
