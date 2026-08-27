# AI 보안 로그 분석기 (AI Security Log Analyzer)

> 보안 로그를 입력하면 AI가 공격 유형과 위험도를 분석해주는 웹 애플리케이션입니다.

---

## 📌 프로젝트 소개

**AI 보안 로그 분석기**는 보안 입문자 및 실무자를 위해 단일 화면에서 최대 100줄의 웹/서버 보안 로그를 분석하고, 대표적인 공격 유형(SQL Injection, XSS, Brute Force, Path Traversal 등)과 위험도(낮음, 중간, 높음, 치명적), 그리고 알기 쉬운 분석 설명을 제공합니다.

---

## 🚀 주요 기능

- **실시간 줄 수 카운팅 & 100줄 제한**: 최대 100줄까지의 보안 로그를 직관적으로 입력 (초과 시 자동 제한 및 안내)
- **AI 기반 공격 유형 판별**:
  - `SQL Injection`
  - `XSS (Cross-Site Scripting)`
  - `Brute Force (무차별 대입)`
  - `Path Traversal (경로 탐색)`
  - `정상 요청` / `판단 불가`
- **4단계 위험도 산출**: `낮음` | `중간` | `높음` | `치명적` (또는 `판단 불가`)
- **이해하기 쉬운 분석 설명**: 공격 판단 이유와 대응 힌트를 1~2문장의 명확한 한국어로 제공
- **단일 화면 원스톱 UX**: 원클릭 분석, 로딩 상태 시각화, 즉시 초기화 기능 지원

---

## 🛠 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **Package Manager**: pnpm

---

## 📂 프로젝트 구조

```text
├── app/                  # Next.js App Router (페이지 및 레이아웃)
│   ├── api/analyze/      # AI 분석 엔드포인트
│   ├── globals.css       # 전역 테마 및 스타일링
│   ├── layout.tsx        # 루트 레이아웃
│   └── page.tsx          # 단일 페이지 메인 화면
├── components/           # UI 및 도메인 컴포넌트
│   ├── app-header.tsx    # 상단 서비스 헤더
│   ├── intro-section.tsx # 서비스 안내
│   ├── log-input-panel.tsx # 로그 입력 및 줄 수 카운터
│   ├── analysis-result-panel.tsx # 분석 결과 카드
│   └── risk-badge.tsx    # 위험도 뱃지
├── docs/                 # 기획 및 개발 관리 문서
│   ├── README.md         # 문서 허브
│   ├── DEVELOPMENT_PLAN.md # 스프린트 단위 개발 계획서 (Sprint 0~5 완료)
│   ├── SPRINT_LOG.md     # 스프린트별 상세 수행 로그
│   └── TEST_CASES.md     # 표준 테스트 케이스 및 PRD 체크리스트 전수 점검서
├── lib/                  # 분석 로직, 테스트 데이터 및 유틸리티
│   ├── analyze.ts        # 핵심 판별 로직 및 에러/상태 정의
│   ├── test-samples.ts   # 표준 6종 테스트 케이스 및 자동 검증 모듈
│   └── utils.ts          # 유틸리티 함수
├── public/               # 정적 애셋 (아이콘, 이미지)
├── PRD.md                # 제품 요구사항 정의서
└── README.md             # 프로젝트 소개 (본 문서)
```

---

## 💻 시작하기

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 개발 서버 실행
```bash
pnpm dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

### 3. 프로덕션 빌드
```bash
pnpm build
pnpm start
```

---

## 📖 관련 문서

- [상세 제품 요구사항 정의서 (PRD.md)](./PRD.md)
- [문서 허브 (docs/README.md)](./docs/README.md)
- [스프린트 개발 계획서 (docs/DEVELOPMENT_PLAN.md)](./docs/DEVELOPMENT_PLAN.md)
- [스프린트 진행 기록 로그 (docs/SPRINT_LOG.md)](./docs/SPRINT_LOG.md)
- [테스트 케이스 명세서 (docs/TEST_CASES.md)](./docs/TEST_CASES.md)
