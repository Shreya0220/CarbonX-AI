import { cn } from '@/lib/utils';
import type { VerificationStatus, Severity } from '@/lib/types';

export function StatusBadge({
  status,
  className,
}: {
  status: VerificationStatus;
  className?: string;
}) {
  const config: Record<VerificationStatus, { label: string; cls: string; dot: string }> = {
    verified: { label: 'Verified', cls: 'bg-success/12 text-success border-success/25', dot: 'bg-success' },
    review: { label: 'Under Review', cls: 'bg-warning/12 text-warning border-warning/25', dot: 'bg-warning' },
    suspicious: { label: 'Suspicious', cls: 'bg-destructive/12 text-destructive border-destructive/25', dot: 'bg-destructive' },
    rejected: { label: 'Rejected', cls: 'bg-destructive/12 text-destructive border-destructive/25', dot: 'bg-destructive' },
  };
  const c = config[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        c.cls,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config: Record<Severity, string> = {
    low: 'bg-info/12 text-info border-info/25',
    medium: 'bg-warning/12 text-warning border-warning/25',
    high: 'bg-destructive/15 text-destructive border-destructive/25',
    critical: 'bg-destructive/20 text-destructive border-destructive/40',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize',
        config[severity]
      )}
    >
      {severity}
    </span>
  );
}

export function ConfidenceBadge({ value, className }: { value: number; className?: string }) {
  const color =
    value >= 80
      ? 'text-success bg-success/10 border-success/25'
      : value >= 60
      ? 'text-warning bg-warning/10 border-warning/25'
      : 'text-destructive bg-destructive/10 border-destructive/25';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold tabular-nums',
        color,
        className
      )}
    >
      {value}%
    </span>
  );
}
