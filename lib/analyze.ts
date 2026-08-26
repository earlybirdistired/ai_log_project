// 공격 유형과 위험도, 분석 상태에 대한 타입 정의
export type AttackType =
  | 'SQL Injection'
  | 'XSS'
  | 'Brute Force'
  | 'Path Traversal'
  | '정상 요청'
  | '판단 불가'

export type RiskLevel = '낮음' | '중간' | '높음' | '치명적'

export type AnalysisStatus = 'idle' | 'analyzing' | 'success' | 'error'

export interface AnalysisResult {
  attackType: AttackType
  risk: RiskLevel
  description: string
  evidence: string[]
  recommendations: string[]
  lineCount: number
  processingTime: string
}

export const MAX_LINES = 100

// 입력값을 줄 단위로 계산 (빈 입력은 0줄)
export function countLines(value: string): number {
  if (value.trim() === '') return 0
  return value.split('\n').length
}

// 100줄을 초과하지 않도록 입력을 제한
export function clampToMaxLines(value: string, max: number = MAX_LINES): string {
  const lines = value.split('\n')
  if (lines.length <= max) return value
  return lines.slice(0, max).join('\n')
}

// 예시로 제공되는 SQL Injection 의심 로그
export const SAMPLE_LOG = `192.168.0.15 - - [26/Aug/2026:10:12:31 +0900] "GET /login HTTP/1.1" 200 1240
203.0.113.25 - - [26/Aug/2026:10:13:04 +0900] "POST /login HTTP/1.1" 401 532
198.51.100.17 - - [26/Aug/2026:10:14:22 +0900] "GET /search?q=' OR 1=1-- HTTP/1.1" 500 821
198.51.100.17 - - [26/Aug/2026:10:14:45 +0900] "GET /product?id=1 UNION SELECT username,password FROM users-- HTTP/1.1" 500 903
192.168.0.15 - - [26/Aug/2026:10:15:10 +0900] "GET /home HTTP/1.1" 200 1580`

/**
 * 목업 분석 함수
 * 실제 AI API를 호출하지 않고, 입력된 로그 문자열의 패턴을 검사하여
 * 디자인과 상태 전환을 확인하기 위한 결과를 생성합니다.
 * (프론트엔드 데모 전용 목업 로직)
 */
export function analyzeLog(log: string): AnalysisResult {
  const lineCount = countLines(log)
  const lower = log.toLowerCase()

  const base = {
    lineCount,
    processingTime: `${(1.2 + Math.random() * 0.6).toFixed(1)}초`,
  }

  // 1. SQL Injection
  if (
    log.includes("' OR 1=1") ||
    lower.includes('union select') ||
    lower.includes('drop table') ||
    log.includes('--')
  ) {
    return {
      ...base,
      attackType: 'SQL Injection',
      risk: '높음',
      description:
        '로그인 또는 검색 요청에 SQL 구문으로 판단되는 비정상적인 입력이 포함되어 있습니다. 조건문과 주석 문자가 함께 사용되어 인증 우회 또는 데이터 조회를 시도했을 가능성이 있습니다.',
      evidence: [
        "쿼리 문자열에서 ' OR 1=1 패턴 탐지",
        'SQL 주석 기호 -- 사용',
        '요청 처리 과정에서 HTTP 500 응답 발생',
        '일반적인 검색어와 다른 비정상 입력 구조',
      ],
      recommendations: [
        '동일 IP의 이전 요청 확인',
        '웹 서버 및 애플리케이션 로그 교차 확인',
        '실제 공격 여부는 담당자 추가 검증 필요',
      ],
    }
  }

  // 2. XSS
  if (
    lower.includes('<script') ||
    lower.includes('javascript:') ||
    lower.includes('onerror=')
  ) {
    return {
      ...base,
      attackType: 'XSS',
      risk: '높음',
      description:
        '요청에 스크립트 실행을 시도하는 것으로 보이는 문자열이 포함되어 있습니다. 사용자 입력이 필터링 없이 페이지에 반영될 경우 악성 스크립트가 실행될 수 있습니다.',
      evidence: [
        '스크립트 태그 또는 javascript: 스킴 탐지',
        '이벤트 핸들러(onerror 등)를 이용한 스크립트 삽입 시도',
        '사용자 입력값에 HTML/JS 제어 문자 포함',
      ],
      recommendations: [
        '동일 IP의 이전 요청 확인',
        '입력값 검증 및 출력 인코딩 적용 여부 확인',
        '실제 공격 여부는 담당자 추가 검증 필요',
      ],
    }
  }

  // 3. Path Traversal
  if (
    log.includes('../') ||
    lower.includes('%2e%2e') ||
    lower.includes('/etc/passwd')
  ) {
    return {
      ...base,
      attackType: 'Path Traversal',
      risk: '높음',
      description:
        '상위 디렉터리로 이동하려는 경로 패턴이 요청에 포함되어 있습니다. 서버 내부의 민감한 파일에 접근을 시도했을 가능성이 있습니다.',
      evidence: [
        '경로에서 ../ 또는 인코딩된 %2e%2e 패턴 탐지',
        '시스템 파일 경로(/etc/passwd 등) 접근 시도',
        '정상적인 리소스 요청과 다른 경로 구조',
      ],
      recommendations: [
        '동일 IP의 이전 요청 확인',
        '경로 정규화 및 접근 제어 설정 확인',
        '실제 공격 여부는 담당자 추가 검증 필요',
      ],
    }
  }

  // 4. Brute Force (401 응답이 5회 이상)
  const unauthorizedCount = (log.match(/401/g) ?? []).length
  if (unauthorizedCount >= 5) {
    return {
      ...base,
      attackType: 'Brute Force',
      risk: '중간',
      description:
        '짧은 시간 동안 인증 실패(HTTP 401) 응답이 반복적으로 발생했습니다. 반복적인 로그인 시도를 통한 무차별 대입 공격일 가능성이 있습니다.',
      evidence: [
        `HTTP 401 인증 실패 응답 ${unauthorizedCount}회 탐지`,
        '동일 엔드포인트에 대한 반복 요청 패턴',
        '정상 사용자 대비 높은 실패율',
      ],
      recommendations: [
        '동일 IP의 이전 요청 확인',
        '로그인 시도 횟수 제한 정책 확인',
        '실제 공격 여부는 담당자 추가 검증 필요',
      ],
    }
  }

  // 5. 정상 요청
  return {
    ...base,
    attackType: '정상 요청',
    risk: '낮음',
    description:
      '현재 입력된 로그에서는 대표적인 공격 패턴이 확인되지 않았습니다. 다만 로그의 양이 제한적이거나 새로운 공격 유형인 경우 탐지되지 않을 수 있습니다.',
    evidence: [
      'SQL Injection, XSS, Path Traversal 패턴 미탐지',
      '반복적인 인증 실패(401) 임계값 미만',
      '요청 구조가 일반적인 정상 트래픽과 유사',
    ],
    recommendations: [
      '정기적인 로그 모니터링 유지',
      '필요 시 더 많은 로그를 함께 분석',
      '실제 공격 여부는 담당자 추가 검증 필요',
    ],
  }
}
