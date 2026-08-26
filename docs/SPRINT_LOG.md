# 스프린트 진행 기록 (Sprint Log)

이 문서는 **AI 보안 로그 분석기** 개발 과정에서 각 스프린트별 수행 내용, 의사결정, 검증 결과를 기록하는 로그입니다.

---

## 🏃 Sprint 0: 개발 환경 점검 및 아키텍처/타입 설계
- **일자:** 2026-08-26
- **상태:** 🟢 완료
- **주요 수행 내역:**
  - `PRD.md` 분석 및 도메인 데이터 모델 정의 (`AttackType`, `RiskLevel`, `AnalysisStatus`, `AnalysisResult`)
  - `RiskLevel`에 `'판단 불가'` 타입 추가
  - Next.js App Router 기반 프로젝트 구조 확립
  - `docs/` 디렉토리 신설 및 `DEVELOPMENT_PLAN.md`, `TEST_CASES.md`, `README.md` 작성

---

## 🏃 Sprint 1: 단일 화면 핵심 UI 및 입력 인터랙션 구현
- **일자:** 2026-08-26
- **상태:** 🟢 완료
- **주요 수행 내역:**
  - PRD 3.2 화면 명세 5개 영역 구현:
    - 서비스 안내 헤더 (`AppHeader`, `IntroSection`)
    - 로그 입력창 (`LogInputPanel`)
    - 분석 실행/초기화 버튼
    - 분석 결과 패널 (`AnalysisResultPanel`)
    - 분석 상태 UI (idle, analyzing, success, error)
  - 실시간 줄 수 카운팅 (`현재 X / 100줄`) 및 최대 100줄 초과 방지 클램핑 로직 구현
  - 6종 표준 테스트 샘플 프리셋 선택 드롭다운 UI 추가
  - E-01(빈 입력 에러 표시), E-02(100줄 초과 경고), E-09(초기화) 연동

---

## 🏃 Sprint 2: AI 분석 엔진 및 백엔드 API 연동
- **일자:** 2026-08-26
- **상태:** 🟢 완료
- **주요 수행 내역:**
  - **백엔드 Route Handler 생성:** `app/api/analyze/route.ts` (`POST /api/analyze`)
  - **공격 유형 6종 판별 로직 고도화:**
    - `SQL Injection`: `' OR 1=1`, `UNION SELECT`, `--` 등 감지
    - `XSS`: `<script>`, `onerror=`, `javascript:` 등 감지
    - `Brute Force`: 짧은 시간 내 HTTP 401 연속 발생 감지
    - `Path Traversal`: `../`, `%2e%2e`, `/etc/passwd` 등 감지
    - `정상 요청`: 표준 웹 트래픽 및 200 OK 응답 위주
    - `판단 불가`: 단편/모호한 로그에 대해 과도한 확정 방지
  - **비동기 API 통신 연동 (`app/page.tsx`):**
    - `fetch('/api/analyze')` 기반 호출
    - `AbortController`를 통한 중복 요청 차단 및 취소
    - 400(빈 입력), 500(서버 오류) 상태 코드 및 에러 핸들링
  - **PowerShell / cURL을 통한 7개 시나리오 API 전수 검증 통과**

---

## 🏃 다음 예정 스프린트
- **Sprint 3:** 전방위 예외 처리 (E-01 ~ E-09) 세부 점검 및 방어 UX 완성
