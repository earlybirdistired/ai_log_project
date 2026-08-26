import { FileText, Bug, Clock } from 'lucide-react'

const BADGES = [
  { icon: FileText, label: '최대 100줄' },
  { icon: Bug, label: '대표 웹 공격 분석' },
  { icon: Clock, label: '1분 이내 결과 확인' },
]

export function IntroSection() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-balance text-foreground sm:text-3xl">
          보안 로그를 빠르게 분석하세요
        </h2>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          웹 서버 로그를 입력하면 공격 유형, 위험도, 판단 근거를 보기 쉽게 확인할
          수 있습니다.
        </p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {BADGES.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground"
          >
            <Icon className="size-4 text-primary" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </section>
  )
}
