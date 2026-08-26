// 공격 유형과 위험도, 분석 상태에 대한 타입 정의
export type AttackType =
  | 'SQL Injection'
  | 'XSS'
  | 'Brute Force'
  | 'Path Traversal'
  | '정상 요청'
  | '판단 불가'

export type RiskLevel = '낮음' | '중간' | '높음' | '치명적' | '판단 불가'

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

export interface PresetLog {
  id: string
  label: string
  attackType: AttackType
  log: string
}

export const PRESET_LOGS: PresetLog[] = [
  {
    id: 'sqli',
    label: 'SQL Injection 공격',
    attackType: 'SQL Injection',
    log: `192.168.0.15 - - [26/Aug/2026:10:12:31 +0900] "GET /login HTTP/1.1" 200 1240
203.0.113.25 - - [26/Aug/2026:10:13:04 +0900] "POST /login HTTP/1.1" 401 532
198.51.100.17 - - [26/Aug/2026:10:14:22 +0900] "GET /search?q=' OR 1=1-- HTTP/1.1" 500 821
198.51.100.17 - - [26/Aug/2026:10:14:45 +0900] "GET /product?id=1 UNION SELECT username,password FROM users-- HTTP/1.1" 500 903
192.168.0.15 - - [26/Aug/2026:10:15:10 +0900] "GET /home HTTP/1.1" 200 1580`,
  },
  {
    id: 'bruteforce',
    label: 'Brute Force 무차별 대입',
    attackType: 'Brute Force',
    log: `203.0.113.45 - - [26/Aug/2026:10:15:00 +0900] "POST /api/login HTTP/1.1" 401 128
203.0.113.45 - - [26/Aug/2026:10:15:01 +0900] "POST /api/login HTTP/1.1" 401 128
203.0.113.45 - - [26/Aug/2026:10:15:02 +0900] "POST /api/login HTTP/1.1" 401 128
203.0.113.45 - - [26/Aug/2026:10:15:03 +0900] "POST /api/login HTTP/1.1" 401 128
203.0.113.45 - - [26/Aug/2026:10:15:04 +0900] "POST /api/login HTTP/1.1" 401 128
203.0.113.45 - - [26/Aug/2026:10:15:05 +0900] "POST /api/login HTTP/1.1" 401 128`,
  },
  {
    id: 'xss',
    label: 'XSS 스크립트 삽입',
    attackType: 'XSS',
    log: `198.51.100.33 - - [26/Aug/2026:10:22:01 +0900] "GET /search?query=<script>alert(document.cookie)</script> HTTP/1.1" 200 4510
198.51.100.33 - - [26/Aug/2026:10:22:08 +0900] "POST /comment HTTP/1.1" 200 512 "body=<img src=x onerror=alert('XSS')>"`,
  },
  {
    id: 'traversal',
    label: 'Path Traversal 경로 탐색',
    attackType: 'Path Traversal',
    log: `203.0.113.88 - - [26/Aug/2026:10:30:12 +0900] "GET /view?file=../../../../etc/passwd HTTP/1.1" 403 234
203.0.113.88 - - [26/Aug/2026:10:30:19 +0900] "GET /download?path=%2e%2e%2f%2e%2e%2fwindows%2fsystem.ini HTTP/1.1" 404 198`,
  },
  {
    id: 'normal',
    label: '정상 웹 요청 트래픽',
    attackType: '정상 요청',
    log: `192.168.1.10 - - [26/Aug/2026:10:00:01 +0900] "GET /index.html HTTP/1.1" 200 4520
192.168.1.10 - - [26/Aug/2026:10:00:02 +0900] "GET /static/css/main.css HTTP/1.1" 200 1230
192.168.1.10 - - [26/Aug/2026:10:00:02 +0900] "GET /static/js/app.js HTTP/1.1" 200 8920
192.168.1.15 - - [26/Aug/2026:10:00:15 +0900] "GET /api/v1/products HTTP/1.1" 200 3410
192.168.1.15 - - [26/Aug/2026:10:00:20 +0900] "GET /about HTTP/1.1" 200 2150`,
  },
  {
    id: 'ambiguous',
    label: '판단 불가 로그 (단편/모호)',
    attackType: '판단 불가',
    log: `10.0.0.5 - - [26/Aug/2026:11:00:00 +0900] "DEBUG test connection payload" 500 0
10.0.0.5 - - [26/Aug/2026:11:00:01 +0900] "INFO ping" 200 4`,
  },
]

// 기본 예시로 제공되는 SQL Injection 의심 로그
export const SAMPLE_LOG = PRESET_LOGS[0].log

/**
 * 목업 분석 함수
 * 입력된 로그 문자열의 패턴을 검사하여 공격 유형, 위험도, 분석 설명을 생성합니다.
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
    log.includes("' or '1'='1") ||
    lower.includes('union select') ||
    lower.includes('drop table') ||
    log.includes('--')
  ) {
    return {
      ...base,
      attackType: 'SQL Injection',
      risk: '높음',
      description:
        '로그인 또는 검색 요청에 SQL 구문으로 판단되는 비정상적인 입력이 포함되어 있어 인증 우회 또는 데이터베이스 탈취 가능성이 있습니다.',
      evidence: [
        "쿼리 문자열에서 SQL 인젝션 패턴(' OR 1=1, UNION SELECT 등) 탐지",
        'SQL 주석 기호(--) 사용 확인',
        '요청 처리 과정에서 이상 응답 코드 발생',
        '일반적인 검색어와 다른 비정상 파라미터 구조',
      ],
      recommendations: [
        '동일 IP의 이전/이후 요청 전수 조사',
        '웹 애플리케이션 방화벽(WAF) 규칙 적용 상태 점검',
        'SQL Prepared Statement 적용 여부 확인',
      ],
    }
  }

  // 2. XSS
  if (
    lower.includes('<script') ||
    lower.includes('javascript:') ||
    lower.includes('onerror=') ||
    lower.includes('onload=')
  ) {
    return {
      ...base,
      attackType: 'XSS',
      risk: '높음',
      description:
        '요청 파라미터에 악성 스크립트 실행을 유도하는 HTML/JS 구문이 포함되어 있습니다. 필터링 없이 사용자 브라우저에 렌더링될 경우 세션 탈취 위험이 있습니다.',
      evidence: [
        '스크립트 태그(<script>) 또는 javascript: URI 스킴 탐지',
        '이벤트 핸들러(onerror, onload)를 통한 스크립트 삽입 시도',
        '사용자 입력값에 HTML 제어 특수문자 포함',
      ],
      recommendations: [
        '동일 IP의 악성 파라미터 요청 이력 확인',
        '입력값 검증 및 브라우저 출력 시 HTML 이스케이프 적용',
        'CSP(Content Security Policy) 헤더 설정 강화',
      ],
    }
  }

  // 3. Path Traversal
  if (
    log.includes('../') ||
    log.includes('..\\') ||
    lower.includes('%2e%2e') ||
    lower.includes('/etc/passwd') ||
    lower.includes('system.ini')
  ) {
    return {
      ...base,
      attackType: 'Path Traversal',
      risk: '높음',
      description:
        '상위 디렉터리로 이동하려는 경로 조작 패턴이 요청에 포함되어 있습니다. 서버 내부의 설정 파일 또는 시스템 파일 무단 열람 시도 가능성이 있습니다.',
      evidence: [
        '경로에서 ../ 또는 인코딩된 %2e%2e 디렉터리 탐색 패턴 탐지',
        '시스템 민감 파일(/etc/passwd, system.ini 등) 접근 시도',
        '정상적인 웹 자원 경로와 상이한 구조',
      ],
      recommendations: [
        '웹 루트 외부 파일 접근 차단 설정 확인',
        '파일 다운로드/뷰어 엔드포인트의 경로 정규화 로직 점검',
        '불필요한 디렉터리 목록화(Directory Listing) 비활성화',
      ],
    }
  }

  // 4. Brute Force (401 응답이 3회 이상 연속)
  const unauthorizedCount = (log.match(/401/g) ?? []).length
  if (unauthorizedCount >= 3) {
    return {
      ...base,
      attackType: 'Brute Force',
      risk: '중간',
      description:
        '동일 엔드포인트에 대해 짧은 시간 동안 반복적인 인증 실패(HTTP 401)가 발생했습니다. 비밀번호 무차별 대입(Brute Force) 공격 시도 가능성이 있습니다.',
      evidence: [
        `HTTP 401 인증 실패 응답 ${unauthorizedCount}회 감지`,
        '동일 IP로부터의 반복적 로그인 시도 패턴',
        '비정상적으로 짧은 요청 주기',
      ],
      recommendations: [
        '로그인 시도 횟수 제한(Rate Limiting) 및 계정 잠금 정책 적용',
        'CAPTCHA 또는 2차 인증(MFA) 도입 검토',
        '공격 발신 IP에 대한 임시 접속 차단 검토',
      ],
    }
  }

  // 5. 판단 불가 (모호하거나 로그 정보가 불충분한 경우)
  if (
    lower.includes('debug') ||
    lower.includes('ping') ||
    lower.includes('unknown') ||
    lineCount < 3 && !lower.includes('http/')
  ) {
    return {
      ...base,
      attackType: '판단 불가',
      risk: '판단 불가',
      description:
        '현재 로그만으로는 공격 여부를 명확하게 판단하기 어렵습니다. 추가적인 접속 로그 및 컨텍스트 확인이 필요합니다.',
      evidence: [
        '대표 공격 패턴(SQLi, XSS, Brute Force 등) 미확인',
        '로그 구조가 단편적이거나 표준 웹 로그 형식을 일부만 포함',
        '공격 의도 판별을 위한 문맥 정보 부족',
      ],
      recommendations: [
        '추가 전후 시간대 서버 접속 로그 확보',
        '서버 방화벽 및 침입 탐지 시스템(IDS) 로그 교차 분석',
        '의심스러운 네트워크 트래픽 추가 모니터링',
      ],
    }
  }

  // 6. 정상 요청
  return {
    ...base,
    attackType: '정상 요청',
    risk: '낮음',
    description:
      '현재 입력된 로그에서는 대표적인 공격 패턴이 확인되지 않았습니다. 일반적인 웹 페이지 조회 및 정상 API 호출 요청으로 판단됩니다.',
    evidence: [
      'SQL Injection, XSS, Path Traversal 악성 구문 미탐지',
      '반복적인 인증 실패(401) 없음 (정상 200/304 응답 위주)',
      '일반적인 웹 클라이언트 트래픽 구조와 일치',
    ],
    recommendations: [
      '정기적인 보안 로그 모니터링 유지',
      '주요 관리자 페이지 접근 권한 관리 점검',
      '신규 취약점에 대비한 주기적 보안 패치',
    ],
  }
}
