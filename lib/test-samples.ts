import {
  analyzeLog,
  isValidAnalysisResult,
  type AttackType,
  type RiskLevel,
} from './analyze'

export interface TestCaseItem {
  id: string
  title: string
  category: 'normal' | 'suspicious' | 'dangerous' | 'ambiguous'
  expectedAttackType: AttackType
  expectedRisk: RiskLevel
  log: string
}

export const TEST_CASES: TestCaseItem[] = [
  {
    id: 'TC-01',
    title: '정상 트래픽 로그 (Normal)',
    category: 'normal',
    expectedAttackType: '정상 요청',
    expectedRisk: '낮음',
    log: `192.168.1.10 - - [26/Aug/2026:10:00:01 +0900] "GET /index.html HTTP/1.1" 200 4520
192.168.1.10 - - [26/Aug/2026:10:00:02 +0900] "GET /static/css/main.css HTTP/1.1" 200 1230
192.168.1.10 - - [26/Aug/2026:10:00:02 +0900] "GET /static/js/app.js HTTP/1.1" 200 8920
192.168.1.15 - - [26/Aug/2026:10:00:15 +0900] "GET /api/v1/products HTTP/1.1" 200 3410
192.168.1.15 - - [26/Aug/2026:10:00:20 +0900] "GET /about HTTP/1.1" 200 2150`,
  },
  {
    id: 'TC-02',
    title: '무차별 대입 공격 (Brute Force)',
    category: 'suspicious',
    expectedAttackType: 'Brute Force',
    expectedRisk: '중간',
    log: `203.0.113.45 - - [26/Aug/2026:10:15:00 +0900] "POST /api/login HTTP/1.1" 401 128
203.0.113.45 - - [26/Aug/2026:10:15:01 +0900] "POST /api/login HTTP/1.1" 401 128
203.0.113.45 - - [26/Aug/2026:10:15:02 +0900] "POST /api/login HTTP/1.1" 401 128
203.0.113.45 - - [26/Aug/2026:10:15:03 +0900] "POST /api/login HTTP/1.1" 401 128
203.0.113.45 - - [26/Aug/2026:10:15:04 +0900] "POST /api/login HTTP/1.1" 401 128
203.0.113.45 - - [26/Aug/2026:10:15:05 +0900] "POST /api/login HTTP/1.1" 401 128`,
  },
  {
    id: 'TC-03',
    title: 'SQL 인젝션 공격 (SQL Injection)',
    category: 'dangerous',
    expectedAttackType: 'SQL Injection',
    expectedRisk: '높음',
    log: `198.51.100.23 - - [26/Aug/2026:10:20:11 +0900] "POST /login.php HTTP/1.1" 200 512 "username=' OR '1'='1' --&password=xxx"
198.51.100.23 - - [26/Aug/2026:10:20:15 +0900] "GET /item.php?id=1 UNION SELECT null,username,password FROM users-- HTTP/1.1" 200 4096`,
  },
  {
    id: 'TC-04',
    title: 'XSS 스크립트 삽입 공격 (XSS)',
    category: 'dangerous',
    expectedAttackType: 'XSS',
    expectedRisk: '높음',
    log: `198.51.100.33 - - [26/Aug/2026:10:22:01 +0900] "GET /search?query=<script>alert(document.cookie)</script> HTTP/1.1" 200 4510
198.51.100.33 - - [26/Aug/2026:10:22:08 +0900] "POST /comment HTTP/1.1" 200 512 "body=<img src=x onerror=alert('XSS')>"`,
  },
  {
    id: 'TC-05',
    title: 'Path Traversal 경로 탐색 공격',
    category: 'dangerous',
    expectedAttackType: 'Path Traversal',
    expectedRisk: '높음',
    log: `203.0.113.88 - - [26/Aug/2026:10:30:12 +0900] "GET /view?file=../../../../etc/passwd HTTP/1.1" 403 234
203.0.113.88 - - [26/Aug/2026:10:30:19 +0900] "GET /download?path=%2e%2e%2f%2e%2e%2fwindows%2fsystem.ini HTTP/1.1" 404 198`,
  },
  {
    id: 'TC-06',
    title: '판단 불가 로그 (Ambiguous)',
    category: 'ambiguous',
    expectedAttackType: '판단 불가',
    expectedRisk: '판단 불가',
    log: `10.0.0.5 - - [26/Aug/2026:11:00:00 +0900] "DEBUG test connection payload" 500 0
10.0.0.5 - - [26/Aug/2026:11:00:01 +0900] "INFO ping" 200 4`,
  },
]

export interface TestRunResult {
  id: string
  title: string
  passed: boolean
  actualAttackType: AttackType
  actualRisk: RiskLevel
  actualDescription: string
  isValidSchema: boolean
  error?: string
}

/**
 * 모든 표준 테스트 케이스를 자동으로 실행하고 검증하는 함수
 */
export function runAllTestCases(): {
  total: number
  passed: number
  failed: number
  results: TestRunResult[]
} {
  const results: TestRunResult[] = TEST_CASES.map((tc) => {
    try {
      const output = analyzeLog(tc.log)
      const validSchema = isValidAnalysisResult(output)
      const attackTypeMatch = output.attackType === tc.expectedAttackType
      const riskMatch = output.risk === tc.expectedRisk
      const passed = validSchema && attackTypeMatch && riskMatch

      return {
        id: tc.id,
        title: tc.title,
        passed,
        actualAttackType: output.attackType,
        actualRisk: output.risk,
        actualDescription: output.description,
        isValidSchema: validSchema,
      }
    } catch (err) {
      return {
        id: tc.id,
        title: tc.title,
        passed: false,
        actualAttackType: '판단 불가',
        actualRisk: '판단 불가',
        actualDescription: '',
        isValidSchema: false,
        error: String(err),
      }
    }
  })

  const total = results.length
  const passed = results.filter((r) => r.passed).length
  const failed = total - passed

  return {
    total,
    passed,
    failed,
    results,
  }
}
