# 프로젝트 문서 허브 (Docs Hub)

이 디렉토리는 **AI 보안 로그 분석기**의 개발 계획, 테스트 명세, 진행 상황 등을 체계적으로 관리하기 위한 문서 저장소입니다.

---

## 📚 문서 목록

| 문서명 | 설명 | 바로가기 |
| :--- | :--- | :--- |
| **개발 계획서** | PRD 요구사항 기반 스프린트(Sprint 0 ~ 5) 로드맵 및 상세 작업 계획 | [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) |
| **스프린트 진행 로그** | 스프린트별 상세 수행 내역, 완료 현황 및 기술적 의사결정 기록 | [SPRINT_LOG.md](./SPRINT_LOG.md) |
| **테스트 케이스 명세서** | 정상, 의심, 위험, 판단불가 등 테스트 로그 데이터셋 및 검증 기준 | [TEST_CASES.md](./TEST_CASES.md) |
| **제품 요구사항 정의서** | 상위 기획 명세서 (PRD) | [PRD.md](../PRD.md) |

---

## 📌 문서 관리 규칙

1. **단일 진실 공급원 (Single Source of Truth):**
   - 모든 개발 및 기능 구현은 [PRD.md](../PRD.md)와 [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)를 기준으로 진행합니다.
2. **스프린트 업데이트:**
   - 각 스프린트 완료 시 `DEVELOPMENT_PLAN.md`의 진행 현황 추적표(Sprint Tracker)와 완료 조건을 최신 상태로 갱신합니다.
3. **테스트 검증:**
   - 기능 변경 시 [TEST_CASES.md](./TEST_CASES.md)의 4종 테스트 케이스가 항상 정상 작동하는지 확인합니다.
