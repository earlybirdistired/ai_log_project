// 🔍 Gemini API 키 연동 검증 및 AI 개발 현황 진단 스크립트
// 실행: node scripts/check-ai-setup.mjs

import { GoogleGenAI } from '@google/genai'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// ─────────────────────────────────────────────────────────────
// 터미널 색상 출력 유틸
// ─────────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgBlue: '\x1b[44m',
}

function log(msg) { process.stdout.write(msg + '\n') }
function pass(label) { log(`  ${C.green}✅ PASS${C.reset}  ${label}`) }
function fail(label) { log(`  ${C.red}❌ FAIL${C.reset}  ${label}`) }
function warn(label) { log(`  ${C.yellow}⚠️  WARN${C.reset}  ${label}`) }
function info(label) { log(`  ${C.cyan}ℹ️  INFO${C.reset}  ${label}`) }
function section(title) {
  log('')
  log(`${C.bold}${C.bgBlue}${C.white}  ${title}  ${C.reset}`)
  log(`${C.dim}${'─'.repeat(60)}${C.reset}`)
}
function banner(title, color = C.bgGreen) {
  const line = '═'.repeat(60)
  log(`${C.bold}${color}${C.white}`)
  log(`  ${line}`)
  log(`  ${title.padEnd(58)}`)
  log(`  ${line}${C.reset}`)
}

// ─────────────────────────────────────────────────────────────
// 메인 진단 함수
// ─────────────────────────────────────────────────────────────
async function main() {
  banner('🤖 AI 보안 로그 분석기 - Gemini API 연동 진단')
  log(`  ${C.dim}실행 시각: ${new Date().toLocaleString('ko-KR')}${C.reset}`)

  let allPassed = true

  // ──────────────────────────────────────────────────────────
  // STEP 1: .env 파일 및 API 키 확인
  // ──────────────────────────────────────────────────────────
  section('STEP 1 ▸ 환경 변수(.env) 설정 확인')

  // .env 파일 수동 로드 (dotenv 없이)
  let apiKey = null
  try {
    const envPath = resolve(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    const match = envContent.match(/GEMINI_API_KEY=(.+)/)
    if (match) {
      apiKey = match[1].trim()
      process.env.GEMINI_API_KEY = apiKey
    }
  } catch {}

  if (apiKey) {
    pass(`.env 파일 존재 및 GEMINI_API_KEY 확인`)
    const masked = apiKey.slice(0, 6) + '...' + apiKey.slice(-6)
    info(`API 키: ${C.yellow}${masked}${C.reset} (길이: ${apiKey.length}자)`)
    info(`키 형식: ${apiKey.startsWith('AQ.') ? `${C.green}Google Gemini 신형 인증키 (AQ. 형식)${C.reset}` : `${C.yellow}일반 형식${C.reset}`}`)
  } else {
    fail('GEMINI_API_KEY가 .env에 없거나 읽을 수 없습니다')
    allPassed = false
  }

  // ──────────────────────────────────────────────────────────
  // STEP 2: Gemini API 실제 통신 테스트
  // ──────────────────────────────────────────────────────────
  section('STEP 2 ▸ Gemini API 실제 통신 테스트')

  if (!apiKey) {
    fail('API 키 없음 - 통신 테스트 건너뜀')
    allPassed = false
  } else {
    try {
      const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
      log(`  ${C.dim}${MODEL_NAME} 모델로 테스트 요청 중...${C.reset}`)
      const start = Date.now()

      const ai = new GoogleGenAI({ apiKey })
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: '다음 보안 로그를 분석해주세요 (JSON으로만 응답):\n\n203.0.113.45 - - [27/Aug/2026] "POST /ssh HTTP/1.1" 401 128\n203.0.113.45 - - [27/Aug/2026] "POST /ssh HTTP/1.1" 401 128\n203.0.113.45 - - [27/Aug/2026] "POST /ssh HTTP/1.1" 401 128' }] }],
        config: {
          systemInstruction: '보안 로그를 분석하여 반드시 아래 JSON만 반환하세요. 다른 텍스트 금지:\n{"attackType":"Brute Force","risk":"중간","description":"설명","evidence":["근거1"],"recommendations":["조치1"]}',
          temperature: 0.1,
          maxOutputTokens: 2048,
          thinkingConfig: { thinkingBudget: 256 },
        },
      })

      const elapsed = ((Date.now() - start) / 1000).toFixed(1)
      const rawText = response.text ?? ''

      pass(`Gemini API 통신 성공 (응답 시간: ${C.cyan}${elapsed}초${C.reset})`)
      info(`모델: ${C.cyan}${MODEL_NAME}${C.reset}`)
      info(`응답 길이: ${rawText.length}자`)

      // JSON 파싱 시도
      try {
        const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
        const parsed = JSON.parse(cleaned)

        pass(`응답 JSON 파싱 성공`)
        log('')
        log(`  ${C.bold}📊 테스트 분석 결과:${C.reset}`)
        log(`     공격 유형: ${C.magenta}${parsed.attackType ?? 'N/A'}${C.reset}`)
        log(`     위험도:   ${C.red}${parsed.risk ?? 'N/A'}${C.reset}`)
        log(`     설명:     ${C.dim}${(parsed.description ?? '').slice(0, 60)}...${C.reset}`)
      } catch (parseErr) {
        warn(`JSON 파싱 실패 (원시 응답): ${rawText.slice(0, 100)}`)
      }

    } catch (err) {
      fail(`Gemini API 통신 실패`)
      log(`     ${C.red}오류: ${err.message}${C.reset}`)
      if (err.message?.includes('401') || err.message?.includes('UNAUTHENTICATED')) {
        warn(`→ API 키가 유효하지 않거나 권한이 없습니다`)
      } else if (err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        warn(`→ 할당량(Quota) 초과입니다. Google AI Studio에서 확인하세요`)
      }
      allPassed = false
    }
  }

  // ──────────────────────────────────────────────────────────
  // STEP 3: 프로젝트 구조 및 현황 확인
  // ──────────────────────────────────────────────────────────
  section('STEP 3 ▸ 프로젝트 AI 연동 구조 현황')

  const files = [
    { path: 'app/api/analyze/route.ts', label: 'API 라우트 (Gemini 연동 핵심)' },
    { path: 'lib/analyze.ts', label: '타입/유효성 검증 모듈' },
    { path: 'lib/test-samples.ts', label: '표준 테스트 케이스 모듈' },
    { path: 'components/analysis-result-panel.tsx', label: '결과 UI 패널' },
    { path: '.env', label: 'API 키 환경 변수' },
    { path: 'docs/DEVELOPMENT_PLAN.md', label: '개발 계획서' },
    { path: 'docs/SPRINT_LOG.md', label: '스프린트 로그' },
    { path: 'docs/TEST_CASES.md', label: '테스트 케이스 명세서' },
  ]

  for (const f of files) {
    try {
      readFileSync(resolve(process.cwd(), f.path))
      pass(`${f.path.padEnd(40)} ${C.dim}(${f.label})${C.reset}`)
    } catch {
      fail(`${f.path.padEnd(40)} ${C.dim}(${f.label})${C.reset}`)
    }
  }

  // ──────────────────────────────────────────────────────────
  // STEP 4: AI 개발 개선 계획 출력
  // ──────────────────────────────────────────────────────────
  section('STEP 4 ▸ AI 기반 서비스 개발 개선 계획')

  const plans = [
    {
      status: '✅ 완료',
      color: C.green,
      title: 'Gemini API 키 설정 및 기본 연동',
      detail: 'GEMINI_API_KEY 환경변수 설정, @google/genai 패키지 설치, route.ts 연동 완료',
    },
    {
      status: '✅ 완료',
      color: C.green,
      title: '시스템 프롬프트 기반 구조화 분석',
      detail: '6대 공격 유형 / 위험도 5단계 정의, JSON 스키마 강제, 로그 유형 자동 판별',
    },
    {
      status: '✅ 완료',
      color: C.green,
      title: '[긴급 수정] 모델 폐기(deprecated) 대응',
      detail: 'gemini-2.0-flash → gemini-3.6-flash 교체 (구 모델 404 NOT_FOUND 응답 확인 후 수정)',
    },
    {
      status: '✅ 완료',
      color: C.green,
      title: '[긴급 수정] 응답 잘림(MAX_TOKENS) 방지',
      detail: 'gemini-3.6-flash가 내부 reasoning에 토큰을 선점(최대 900+ thoughtsToken)해 JSON이 중간에 잘리던 문제 발견 → maxOutputTokens 2048 + thinkingConfig.thinkingBudget 256으로 고정해 해결',
    },
    {
      status: '✅ 완료',
      color: C.green,
      title: '.env 커밋 방지',
      detail: '.gitignore에 .env 추가 (기존에는 .env*.local만 제외되어 실키 유출 위험 있었음)',
    },
    {
      status: '✅ 완료',
      color: C.green,
      title: '[Sprint 6] AI 응답 타임아웃/재시도 (실측 기반 재설계)',
      detail: '정상 응답도 45초+ 걸릴 수 있음을 실측 확인 → 45초 단일 타임아웃 + 5초 이내 빠른 실패만 재시도, 429(할당량)는 즉시 실패. 클라이언트 55초 안전장치 추가',
    },
    {
      status: '✅ 완료',
      color: C.green,
      title: '[운영 이슈] gemini-3.6-flash 무료 등급 일일 할당량(20건) 소진',
      detail: 'GEMINI_MODEL 환경변수로 gemini-3.5-flash-lite로 임시 전환(별도 할당량 풀, 응답 1.5~2초). 프로덕션 전환 시 Billing 업그레이드 필요',
    },
    {
      status: '✅ 완료',
      color: C.green,
      title: '[Sprint 7] 로그 유형 자동 감지 고도화 (SSH/HTTP/Nginx 구분)',
      detail: 'SYSTEM_PROMPT에 로그 포맷 판별 규칙 추가, logFormat 필드 신설 및 UI 배지 표시. 실제 SSH 로그로 검증 완료',
    },
    {
      status: '✅ 완료',
      color: C.green,
      title: '[Sprint 8] 분석 결과 신뢰도(Confidence) 표시',
      detail: 'confidence(높음/중간/낮음) 필드 추가, UI에 "확신도 OO" 배지 표시. 판단 불가 로그에서 낮음으로 일관 반환 확인',
    },
    {
      status: '✅ 완료',
      color: C.green,
      title: '[Sprint 9] 멀티 공격 유형 복합 감지',
      detail: 'secondaryAttackTypes 필드 추가(0~2개, enum 검증). Brute Force+SQL Injection 혼합 로그로 복합 탐지 검증 완료',
    },
    {
      status: '✅ 완료',
      color: C.green,
      title: '[Sprint 10] 분석 히스토리 (세션 메모리) 기능',
      detail: 'DB/localStorage 미사용, React 상태로만 최근 3건 보관. 프롬프트 인젝션 방지를 위해 enum 검증 후에만 반영. 정상/악의적 입력 모두 검증 완료',
    },
    {
      status: '✅ 완료',
      color: C.green,
      title: '[Sprint 11] 스트리밍 응답(타이핑 효과) — 범위 조정',
      detail: '서버 JSON 검증 안정성 유지를 위해 원시 토큰 스트리밍 대신, 검증 완료된 description을 클라이언트에서 타이핑 효과로 렌더링. 브라우저 시각 확인은 미완료(권장)',
    },
  ]

  for (const plan of plans) {
    log(``)
    log(`  ${plan.color}${plan.status}${C.reset}  ${C.bold}${plan.title}${C.reset}`)
    log(`     ${C.dim}${plan.detail}${C.reset}`)
  }

  // ──────────────────────────────────────────────────────────
  // 최종 요약
  // ──────────────────────────────────────────────────────────
  log('')
  if (allPassed) {
    banner('🎉 진단 완료 - Gemini API 연동 정상 작동 확인!', C.bgGreen)
  } else {
    banner('⚠️  진단 완료 - 일부 항목 확인 필요', C.bgRed)
  }

  log('')
  log(`  ${C.bold}📌 즉시 실행 가능한 다음 단계:${C.reset}`)
  log(`     1. ${C.cyan}http://localhost:3000${C.reset} 에서 SSH 로그 입력 후 분석 테스트`)
  log(`     2. 브라우저 개발자도구 → 네트워크 탭에서 /api/analyze 응답 확인`)
  log(`     3. 서버 터미널에서 Gemini API 처리 로그 실시간 확인`)
  log('')
}

main().catch((err) => {
  log(`\n${C.red}스크립트 실행 오류: ${err.message}${C.reset}`)
  process.exit(1)
})
