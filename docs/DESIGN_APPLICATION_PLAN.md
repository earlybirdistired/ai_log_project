# SEC-OPS Terminal 디자인 적용 계획서

> **기준 문서:** [디자인.md](./디자인.md)
> **목적:** `디자인.md`에 정의된 SEC-OPS Terminal 디자인 토큰(색상/타이포/spacing/shape/effects)을
> 전체 사이트(단일 페이지 `app/page.tsx` 및 하위 컴포넌트)의 톤앤매너에 일관되게 반영한다.
> **작성일:** 2026-08-27

---

## 0. 진행 경위 (중요)

이 문서 작성 도중 사용자 요청이 들어오기 전, 이미 디자인 토큰의 핵심 항목(색상/모서리/타이포/일부
효과)을 코드에 먼저 적용했다. 원래는 계획서 → 확인 → 적용 순서로 진행했어야 했다. 아래 표는
"계획"과 "이미 적용된 현황"을 함께 정리해 지금 상태를 정확히 파악할 수 있게 한다.

---

## 1. 매핑 전략

이 프로젝트는 Tailwind v4 + CSS 커스텀 프로퍼티(`app/globals.css`) 기반으로, 모든 색상이
`:root`의 CSS 변수 하나로 중앙 관리된다(shadcn 스타일). 따라서 컴포넌트 파일을 거의 건드리지 않고
`globals.css`만 바꿔도 전체 사이트 색상이 바뀐다. `디자인.md`의 Material 3 스타일 토큰명을
기존 shadcn 슬롯에 아래와 같이 매핑했다.

| 디자인.md 토큰 | 값 | 매핑된 CSS 변수 | 비고 |
| --- | --- | --- | --- |
| surface | #fcf9f2 | `--background` | |
| surface-container-lowest | #ffffff | `--card` | 카드가 배경보다 밝게 떠 보이도록 |
| surface-container-low | #f6f3ec | `--popover` | |
| surface-container | #f0ede6 | `--muted` | |
| surface-container-high | #eae7e0 | `--accent` | hover 배경 |
| on-surface | #162839 | `--foreground`, `--card-foreground`, `--popover-foreground`, `--accent-foreground` | |
| on-surface-variant | #44474e | `--muted-foreground` | |
| primary (= outline) | #162839 | `--primary`, `--ring` | 짙은 잉크 톤. outline과 동일 값이라 별도 토큰 추가 없이 재사용 |
| on-primary | #ffffff | `--primary-foreground` | |
| secondary-container | #d7e3f7 | `--secondary` | 기존 배지/보조버튼이 "옅은 배경" 용도라 강한 secondary(#535f70) 대신 container 톤 사용 |
| on-secondary-container | #101c2b | `--secondary-foreground` | |
| outline-variant | #c4c6cf | `--border`, `--input` | 일반 1px 구분선 |
| error | #ba1a1a | `--destructive` | |
| security-low/medium/high/critical | #2e7d32 / #ed6c02 / #d32f2f / #9a0007 | `--risk-low/medium/high/critical` | 위험도 배지에 그대로 사용 중(추가 작업 불필요) |
| shapes.corner-radius | 0px | `--radius: 0rem` | `rounded-sm/md/lg/xl/2xl/3xl/4xl`가 전부 이 변수에서 파생되므로 자동 전파됨 |
| typography.family | JetBrains Mono | `<body>` 클래스 `font-sans` → `font-mono` | 폰트 자체는 이미 `next/font`로 로드되어 있어 클래스만 교체 |
| effects.shadows | none | 개별 `shadow-sm`/`shadow-lg` 클래스 제거 | 이 프로젝트엔 3곳뿐이라 전역 오버라이드 대신 직접 제거 |
| principles: heavy borders | border-width 2px | 구조적 패널에 `border-2 border-primary` | 전 요소 대신 "핵심 패널 2곳 + 드롭다운"에만 적용(과함 방지) |
| principles: sharp corners | 위 radius=0과 별개로 `rounded-full`(고정 pill) | `rounded-none`으로 치환 | `--radius`가 영향 못 주는 유일한 케이스라 직접 치환 필요 |

`unstyled-full` 관련: Tailwind의 `rounded-full`은 `--radius` 변수와 무관한 고정 유틸리티라
전 파일에서 직접 `rounded-none`으로 바꿔야 했다(자동 전파 안 됨).

---

## 2. 적용 범위 체크리스트 (완료 / 예정)

| 항목 | 상태 | 내용 |
| --- | :---: | --- |
| 색상 토큰 전체 교체 (`globals.css` `:root`) | ✅ 완료 | background/foreground/card/popover/primary/secondary/muted/accent/destructive/border/input/ring |
| 위험도 색상 (security-low/medium/high/critical) | ✅ 완료 | `--risk-*` 4종 교체. `risk-badge.tsx`는 수정 불필요(변수만 참조) |
| corner-radius: 0px | ✅ 완료 | `--radius: 0rem` — `rounded-md/lg/xl` 등 자동 반영 |
| `rounded-full` → `rounded-none` 치환 | ✅ 완료 | `app/page.tsx`, `analysis-result-panel.tsx`, `app-header.tsx`, `intro-section.tsx` 총 10곳 |
| 타이포그래피: 전체 JetBrains Mono | ✅ 완료 | `app/layout.tsx` body `font-sans` → `font-mono` |
| effects.shadows: none | ✅ 완료 | `log-input-panel.tsx`(2곳), `analysis-result-panel.tsx`(1곳) `shadow-sm`/`shadow-lg` 제거 |
| Structural Rigidity: heavy border | ✅ 완료(부분) | 로그 입력 패널, 분석 결과 패널, 프리셋 드롭다운 → `border-2 border-primary`. 나머지 배지/버튼은 기존 1px 유지(과하게 무거워지는 것 방지 목적, 의도적 범위 제한) |
| theme-color 메타 태그 | ✅ 완료 | `#f5f7fb` → `#fcf9f2` (새 배경색과 일치) |
| spacing 토큰 정합성 검증 (unit 4px / padding 24px / gutter 16px) | ⚪ 미착수 | Tailwind 기본 spacing 스케일이 이미 4px 단위라 대체로 부합하지만, 컨테이너 패딩/거터 값을 디자인.md 수치와 1:1로 명시적으로 맞추는 감사는 아직 안 함 |
| animations.cursor: pulse 1s infinite | ⚪ 미착수 | 타이핑 효과 커서(Sprint 11)가 Tailwind 기본 `animate-pulse`(2s 주기) 사용 중 — 스펙은 1s. 필요 시 커스텀 duration으로 조정 가능 |
| animations.transition: fast 150ms | 🟡 사실상 충족 | Tailwind `transition-colors` 기본 duration이 150ms라 별도 작업 불필요 |
| border-width 2px 전면 확대 여부 | ⚪ 보류 | 모든 배지/버튼까지 2px로 넓힐지는 스타일 취향 문제 — 현재는 핵심 패널만 적용. 원하면 다음 스프린트에서 확대 |
| 다크모드 변수 동기화 | ⚪ 보류 | 앱이 현재 라이트 모드로 고정(`html` 클래스 `light` 하드코딩, 토글 UI 없음)이라 `.dark`/`prefers-color-scheme` 블록은 건드리지 않음. 추후 다크모드 토글을 추가한다면 그때 함께 재작업 필요 |
| 실제 브라우저 시각 검증 (스크린샷) | ⚪ 대기 | Claude in Chrome 확장이 이번 세션에 연결되지 않아 스크린샷 확인 불가. 컴파일된 CSS에 새 값(`--background:#fcf9f2`, `--radius:0rem`, `--risk-critical:#9a0007`)이 정상 반영된 것은 확인함 |

---

## 3. 검증 방법

- `npx tsc --noEmit` — 통과 확인
- 개발 서버(`http://localhost:3000`)가 빌드 에러 없이 정상 응답(200) 확인
- 컴파일된 CSS 번들에서 신규 토큰 값 존재 확인 (`--background: #fcf9f2`, `--radius: 0rem`, `--risk-critical: #9a0007`)
- 브라우저 육안 확인은 미완료 — 확장 연결 또는 사용자 직접 확인 권장

## 4. 다음 단계 제안

1. 브라우저에서 직접 확인 후 톤앤매너가 의도와 맞는지 피드백
2. 필요 시 border-width 2px 범위 확대(배지/버튼까지)
3. spacing 값 명시적 감사(24px 컨테이너 패딩 / 16px 거터 기준)
4. 타이핑 커서 애니메이션 duration을 1s로 맞출지 결정
