import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5 max-w-2xl">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function PrototypeNotice({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border border-warning/25 bg-warning/5 px-3 py-2 text-xs text-muted-foreground', className)}>
      <span className="font-semibold text-warning">Prototype Notice:</span>{' '}
      This is a decision-support prototype for academic demonstration using sample data. Not a legally certified verification system.
    </div>
  );
}
