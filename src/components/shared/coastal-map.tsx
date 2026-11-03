import { cn } from '@/lib/utils';
import type { ProjectMarker } from '@/lib/types';

export function CoastalMap({
  markers,
  onMarkerClick,
  selectedId,
  className,
  showOverlaps,
}: {
  markers: ProjectMarker[];
  onMarkerClick?: (id: string) => void;
  selectedId?: string;
  className?: string;
  showOverlaps?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br from-accent/8 via-primary/4 to-background bg-dots',
        className
      )}
    >
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {/* India coastline silhouette */}
        <path
          d="M 18 8 L 24 10 L 30 8 L 38 12 L 44 10 L 52 14 L 58 12 L 66 16 L 72 14 L 78 20 L 82 28 L 84 36 L 82 44 L 78 52 L 72 58 L 66 62 L 58 66 L 50 70 L 42 72 L 34 70 L 28 66 L 22 58 L 18 50 L 16 42 L 14 34 L 16 26 L 18 18 Z"
          fill="hsl(var(--accent) / 0.06)"
          stroke="hsl(var(--accent) / 0.25)"
          strokeWidth="0.4"
        />
        {/* Water layer */}
        <path
          d="M 0 0 L 100 0 L 100 100 L 0 100 Z M 18 8 L 24 10 L 30 8 L 38 12 L 44 10 L 52 14 L 58 12 L 66 16 L 72 14 L 78 20 L 82 28 L 84 36 L 82 44 L 78 52 L 72 58 L 66 62 L 58 66 L 50 70 L 42 72 L 34 70 L 28 66 L 22 58 L 18 50 L 16 42 L 14 34 L 16 26 L 18 18 Z"
          fill="hsl(var(--accent) / 0.03)"
          fillRule="evenodd"
        />
        {/* Overlap zones */}
        {showOverlaps && (
          <>
            <ellipse cx="48" cy="52" rx="6" ry="5" fill="hsl(var(--destructive) / 0.12)" stroke="hsl(var(--destructive) / 0.4)" strokeWidth="0.3" strokeDasharray="1 1" />
            <ellipse cx="52" cy="50" rx="5.5" ry="4.5" fill="hsl(var(--warning) / 0.1)" stroke="hsl(var(--warning) / 0.4)" strokeWidth="0.3" strokeDasharray="1 1" />
          </>
        )}
      </svg>

      {/* Markers */}
      {markers.map((m) => {
        const color =
          m.status === 'verified'
            ? 'bg-success'
            : m.status === 'review'
            ? 'bg-warning'
            : m.status === 'suspicious'
            ? 'bg-destructive'
            : 'bg-destructive';
        const isSelected = selectedId === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onMarkerClick?.(m.id)}
            className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            title={m.name}
          >
            {isSelected && (
              <span className={cn('absolute inset-0 -m-1 rounded-full animate-pulse-ring', color)} />
            )}
            <span
              className={cn(
                'block h-3 w-3 rounded-full ring-2 ring-background transition-transform group-hover:scale-150',
                color,
                isSelected && 'scale-150'
              )}
            />
            <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[10px] font-medium text-popover-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100 z-10">
              {m.name}
            </span>
          </button>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-lg border bg-card/90 px-3 py-2 text-[10px] backdrop-blur-sm">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Verified</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" /> Under Review</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" /> Suspicious</span>
      </div>
    </div>
  );
}
