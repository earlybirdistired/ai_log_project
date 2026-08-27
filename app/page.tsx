import Link from 'next/link'
import {
  ArrowRight,
  Cpu,
  ScanSearch,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SquareTerminal,
  Upload,
  Zap,
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'SHELL', active: true },
  { label: 'LOGS', active: false },
  { label: 'MODELS', active: false },
  { label: 'THREATS', active: false },
]

const STEPS = [
  {
    number: '01',
    label: 'INPUT LOGS',
    icon: Upload,
    title: '로그 붙여넣기',
    description: '웹 서버 로그를 그대로 복사해 입력창에 붙여넣습니다 (최대 100줄).',
  },
  {
    number: '02',
    label: 'AI ANALYSIS',
    icon: Cpu,
    title: 'AI 분석 실행',
    description: 'Gemini 기반 AI가 로그를 스캔해 대표적인 공격 패턴을 식별합니다.',
  },
  {
    number: '03',
    label: 'THREAT ASSESSMENT',
    icon: ShieldAlert,
    title: '위험도 평가',
    description: '공격 유형과 위험도, 판단 근거, 권장 대응 조치를 정리해 보여줍니다.',
  },
]

const FEATURES = [
  {
    icon: Zap,
    title: 'REPRESENTATIVE ATTACK DETECTION',
    description:
      'SQL Injection, XSS, Brute Force, Path Traversal 등 대표적인 웹 공격 패턴을 탐지합니다.',
  },
  {
    icon: ScanSearch,
    title: 'EVIDENCE-BASED VERDICT',
    description:
      '왜 그렇게 판단했는지 근거와 함께 제시해, 신뢰할 수 있는 1차 판단을 돕습니다.',
    full: false,
  },
  {
    icon: ShieldCheck,
    title: 'NO LOGIN · NO STORAGE',
    description:
      '계정 없이 바로 사용하고, 입력한 로그와 분석 결과는 서버에 저장하지 않습니다.',
    full: true,
  },
]

function AsciiDivider({ label }: { label: string }) {
  return (
    <div className="flex w-full items-center gap-4 px-6">
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
      <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" aria-hidden="true" />
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background font-mono text-foreground">
      {/* Top App Bar */}
      <header className="hidden w-full items-center justify-between border-b-2 border-primary px-6 py-4 md:flex">
        <div className="text-lg font-bold uppercase tracking-tight text-foreground">
          SEC-OPS // TERMINAL
        </div>
        <nav className="flex items-center gap-4">
          {NAV_LINKS.map(({ label, active }) => (
            <a
              key={label}
              href="#"
              className={`px-2 py-1 text-sm transition-colors duration-150 ease-in-out hover:bg-primary hover:text-primary-foreground ${
                active ? 'border-b-2 border-primary font-bold text-foreground' : 'text-muted-foreground'
              }`}
            >
              {label}
            </a>
          ))}
          <div className="ml-4 flex items-center gap-2 border-l-2 border-primary pl-4">
            <button
              type="button"
              aria-label="Settings"
              className="p-1 text-foreground transition-colors duration-150 ease-in-out hover:bg-primary hover:text-primary-foreground"
            >
              <Settings className="size-5" aria-hidden="true" />
            </button>
            <Link
              href="/analyze"
              aria-label="Open analyzer terminal"
              className="p-1 text-foreground transition-colors duration-150 ease-in-out hover:bg-primary hover:text-primary-foreground"
            >
              <SquareTerminal className="size-5" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile Header */}
      <header className="flex w-full items-center justify-between border-b-2 border-primary px-4 py-3 md:hidden">
        <div className="text-base font-bold uppercase tracking-tight text-foreground">
          SEC-OPS // TERMINAL
        </div>
        <Link
          href="/analyze"
          aria-label="Open analyzer terminal"
          className="p-1 text-foreground"
        >
          <SquareTerminal className="size-5" aria-hidden="true" />
        </Link>
      </header>

      <main className="flex w-full flex-grow flex-col items-center">
        {/* Hero */}
        <section className="flex w-full max-w-[1200px] flex-col items-center px-6 py-20 text-center md:py-28">
          <h1 className="mb-6 border-b-2 border-primary pb-4 text-3xl font-extrabold uppercase leading-tight tracking-tight text-foreground sm:text-4xl md:text-[56px]">
            AI를 통한 보안 로그 해독
          </h1>
          <p className="mb-10 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            &gt; 로그 몇 줄로 공격 유형과 위험도를 파악하세요. 복잡한 원시 로그를 실행 가능한
            판단 근거로 바꿔드립니다. 시스템 상태 확인 중... [OK]
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 border-2 border-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-foreground transition-colors duration-150 ease-in-out hover:bg-primary hover:text-primary-foreground active:border-dashed"
          >
            [ INITIALIZE SYSTEM ]
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

          <div className="mt-16 w-full max-w-3xl border-2 border-primary">
            <div className="flex items-center justify-between border-b-2 border-primary bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground">
              <span>TERMINAL_OUTPUT.LOG</span>
              <span>STATUS: READY</span>
            </div>
            <div className="h-40 overflow-y-auto bg-muted p-4 text-left text-sm leading-relaxed text-foreground">
              <p>&gt; SYSTEM BOOT SEQUENCE INITIATED...</p>
              <p>&gt; LOADING GEMINI AI MODEL... [OK]</p>
              <p>&gt; READY FOR LOG INPUT... [OK]</p>
              <p className="mt-2 font-bold">
                &gt; WAITING FOR INPUT...
                <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-foreground" aria-hidden="true" />
              </p>
            </div>
          </div>
        </section>

        <AsciiDivider label="PROCESS FLOW" />

        {/* How it works */}
        <section className="w-full max-w-[1200px] px-6 py-16">
          <h2 className="mb-12 text-center text-2xl font-bold uppercase text-foreground">
            &gt;_ 작동 방식
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map(({ number, label, icon: Icon, title, description }) => (
              <div key={number} className="relative flex h-full flex-col border-2 border-primary">
                <div className="absolute -left-4 -top-4 bg-background px-2 text-2xl font-extrabold text-foreground">
                  {number}
                </div>
                <div className="border-b-2 border-primary bg-primary px-4 py-2 text-center text-xs font-bold uppercase tracking-widest text-primary-foreground">
                  {label}
                </div>
                <div className="flex flex-grow flex-col items-center gap-3 p-6 text-center">
                  <Icon className="size-10 text-foreground" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <AsciiDivider label="SYSTEM CAPABILITIES" />

        {/* Key features */}
        <section className="w-full max-w-[1200px] px-6 py-16">
          <h2 className="mb-12 text-center text-2xl font-bold uppercase text-foreground">
            &gt;_ 주요 기능
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {FEATURES.map(({ icon: Icon, title, description, full }) => (
              <div
                key={title}
                className={`flex items-start gap-4 border-2 border-primary p-6 ${full ? 'md:col-span-2' : ''}`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center border-2 border-primary bg-primary text-primary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="mb-2 inline-block border-b-2 border-primary pb-1 text-base font-semibold uppercase tracking-wide text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Secondary CTA */}
        <section className="mt-8 w-full border-y-2 border-primary bg-muted py-20 text-center">
          <div className="mx-auto max-w-[1200px] px-6">
            <h2 className="mb-6 text-balance text-2xl font-extrabold uppercase text-foreground sm:text-3xl md:text-4xl">
              보안 판단, 지금 바로 시작하세요
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              더 이상 로그를 눈으로만 훑지 마세요. AI 기반 분석으로 위험 신호를 먼저
              찾아내세요.
            </p>
            <Link
              href="/analyze"
              className="inline-block bg-primary px-10 py-5 text-lg font-bold uppercase tracking-widest text-primary-foreground transition-colors duration-150 ease-in-out hover:bg-background hover:text-foreground hover:outline hover:outline-2 hover:outline-primary"
            >
              &gt; EXECUTE_ANALYSIS.SH
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex w-full flex-col items-center gap-2 border-t-2 border-primary px-6 py-4 text-center text-xs sm:flex-row sm:justify-between sm:text-left">
        <div className="font-bold uppercase tracking-widest text-foreground">
          (C) 2026 AI-SEC-CORE · AI 분석 결과는 참고용이며, 로그인 및 저장 없이 동작합니다
        </div>
        <nav className="flex items-center gap-4">
          <a href="#" className="uppercase tracking-widest text-muted-foreground hover:text-foreground">
            PRIVACY
          </a>
          <a href="#" className="uppercase tracking-widest text-muted-foreground hover:text-foreground">
            LICENSE
          </a>
          <Link href="/analyze" className="uppercase tracking-widest text-muted-foreground hover:text-foreground">
            DOCS
          </Link>
        </nav>
      </footer>
    </div>
  )
}
