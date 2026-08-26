import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldX, HelpCircle } from 'lucide-react'
import type { RiskLevel } from '@/lib/analyze'

const RISK_CONFIG: Record<
  RiskLevel,
  { className: string; Icon: typeof ShieldCheck }
> = {
  낮음: {
    className: 'border-risk-low/40 bg-risk-low/15 text-risk-low',
    Icon: ShieldCheck,
  },
  중간: {
    className: 'border-risk-medium/40 bg-risk-medium/15 text-risk-medium',
    Icon: ShieldAlert,
  },
  높음: {
    className: 'border-risk-high/40 bg-risk-high/15 text-risk-high',
    Icon: AlertTriangle,
  },
  치명적: {
    className: 'border-risk-critical/50 bg-risk-critical/20 text-risk-critical',
    Icon: ShieldX,
  },
  '판단 불가': {
    className: 'border-muted-foreground/40 bg-muted/30 text-muted-foreground',
    Icon: HelpCircle,
  },
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const { className, Icon } = RISK_CONFIG[risk]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm font-semibold ${className}`}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span>위험도 {risk}</span>
    </span>
  )
}
