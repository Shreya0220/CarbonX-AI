import { useState } from 'react';
import { Leaf, ShieldCheck, Waves, BarChart3, Map, Brain, AlertTriangle, FlaskConical, FileCheck, Link2, FileText, Settings, LayoutDashboard, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PageKey } from '@/lib/types';

interface NavItem {
  key: PageKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: string;
}

const navItems: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Dashboard' },
  { key: 'projects', label: 'Projects', icon: FolderKanban, group: 'Dashboard' },
  { key: 'ai-verification', label: 'AI Verification', icon: Brain, group: 'Analysis' },
  { key: 'geo-evidence', label: 'Geo Evidence', icon: Map, group: 'Analysis' },
  { key: 'carbon-analysis', label: 'Carbon Analysis', icon: Leaf, group: 'Analysis' },
  { key: 'risk', label: 'Risk & Anomalies', icon: AlertTriangle, group: 'Analysis' },
  { key: 'simulator', label: 'What-If Simulator', icon: FlaskConical, group: 'Tools' },
  { key: 'verifier', label: 'Verifier Review', icon: FileCheck, group: 'Tools' },
  { key: 'blockchain', label: 'Blockchain Audit', icon: Link2, group: 'Tools' },
  { key: 'analytics', label: 'Analytics', icon: BarChart3, group: 'Insights' },
  { key: 'reports', label: 'Reports', icon: FileText, group: 'Insights' },
  { key: 'settings', label: 'Settings', icon: Settings, group: 'Insights' },
];

export function Sidebar({
  current,
  onNavigate,
  open,
  onClose,
}: {
  current: PageKey;
  onNavigate: (key: PageKey) => void;
  open: boolean;
  onClose: () => void;
}) {
  const groups = ['Dashboard', 'Analysis', 'Tools', 'Insights'];
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md">
            <Waves className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight">CarbonX AI</span>
            <span className="text-[10px] text-muted-foreground">Blue Carbon Intelligence</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          {groups.map((group) => (
            <div key={group} className="mb-5">
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{group}</p>
              <div className="space-y-0.5">
                {navItems
                  .filter((n) => n.group === group)
                  .map((item) => {
                    const active = current === item.key;
                    const Icon = item.icon;
                    const isHovered = hovered === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          onNavigate(item.key);
                          onClose();
                        }}
                        onMouseEnter={() => setHovered(item.key)}
                        onMouseLeave={() => setHovered(null)}
                        className={cn(
                          'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-transform',
                            isHovered && !active && 'scale-110',
                            active && 'text-primary'
                          )}
                        />
                        {item.label}
                        {item.key === 'verifier' && (
                          <span className="ml-auto rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-bold text-warning">3</span>
                        )}
                        {item.key === 'risk' && (
                          <span className="ml-auto rounded-full bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold text-destructive">11</span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
            <ShieldCheck className="h-4 w-4 text-success shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold text-foreground">Prototype Mode</span>
              <span className="text-[9px] text-muted-foreground">Academic Demo v1.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
