import { useState } from 'react';
import { AlertTriangle, Copy, Layers, FileWarning, Eye, MapPin, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SeverityBadge, ConfidenceBadge } from '@/components/shared/badges';
import { CoastalMap } from '@/components/shared/coastal-map';
import { PageHeader, PrototypeNotice } from '@/components/shared/page-header';
import { projects, projectMarkers, allAnomalies } from '@/lib/mock-data';
import type { PageKey } from '@/lib/types';
import { cn } from '@/lib/utils';

export function RiskPage({ onNavigate }: { onNavigate: (page: PageKey, projectId?: string) => void }) {
  const [selectedOverlap, setSelectedOverlap] = useState(0);
  const overlapPairs = [
    { a: projects[0], b: projects[6], overlap: 87 },
    { a: projects[2], b: projects[5], overlap: 73 },
  ];
  const pair = overlapPairs[selectedOverlap];

  const anomalyCards = [
    { label: 'Potential Duplicate Claims', value: 3, icon: Copy, color: 'bg-destructive/10 text-destructive', trend: '+2 this month' },
    { label: 'Area Mismatch', value: 5, icon: Layers, color: 'bg-warning/10 text-warning', trend: '+1 this month' },
    { label: 'Data Inconsistency', value: 4, icon: FileWarning, color: 'bg-warning/10 text-warning', trend: 'stable' },
    { label: 'Evidence Gap', value: 6, icon: Eye, color: 'bg-info/10 text-info', trend: '+2 this month' },
    { label: 'Suspicious Spatial Overlap', value: 2, icon: MapPin, color: 'bg-destructive/10 text-destructive', trend: '+1 this month' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk & Anomalies"
        description="AI-powered anomaly detection dashboard for blue-carbon verification — duplicate claims, area mismatches, and spatial overlaps."
        icon={AlertTriangle}
      />
      <PrototypeNotice />

      {/* Anomaly cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {anomalyCards.map((c, i) => (
          <Card key={c.label} className="animate-fade-up hover:shadow-lg transition-shadow" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-4">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg mb-2', c.color)}>
                <c.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold tabular-nums">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">{c.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Anomaly table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Anomaly Registry</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Project</th>
                  <th className="px-4 py-3 font-semibold">Anomaly Type</th>
                  <th className="px-4 py-3 font-semibold">Severity</th>
                  <th className="px-4 py-3 font-semibold">Confidence</th>
                  <th className="px-4 py-3 font-semibold">Detected At</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {allAnomalies.map((a, i) => {
                  const project = projects.find((p) => a.id.startsWith(p.id));
                  return (
                    <tr
                      key={a.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer animate-fade-up"
                      style={{ animationDelay: `${i * 30}ms` }}
                      onClick={() => onNavigate('project-details', project?.id)}
                    >
                      <td className="px-4 py-3 text-xs font-medium">{project?.name.split(' ')[0] || '—'}</td>
                      <td className="px-4 py-3 text-xs">{a.type}</td>
                      <td className="px-4 py-3"><SeverityBadge severity={a.severity} /></td>
                      <td className="px-4 py-3"><ConfidenceBadge value={a.confidence} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.detectedAt}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn('text-xs capitalize', a.status === 'open' ? 'border-destructive/25 text-destructive' : a.status === 'reviewing' ? 'border-warning/25 text-warning' : 'border-success/25 text-success')}>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Duplicate claim detection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Copy className="h-5 w-5 text-destructive" />
              <div>
                <CardTitle className="text-base">Duplicate Claim Detection</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Spatial overlap analysis between adjacent project boundaries</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {overlapPairs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOverlap(i)}
                  className={cn('rounded-lg px-3 py-1 text-xs font-medium transition-colors', selectedOverlap === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70')}
                >
                  Case {i + 1}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Overlap map */}
            <CoastalMap
              markers={projectMarkers.filter(m => m.id === pair.a.id || m.id === pair.b.id)}
              className="h-[280px]"
              showOverlaps
            />

            {/* Overlap details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] text-muted-foreground">Project A</p>
                  <p className="text-sm font-semibold mt-0.5">{pair.a.name}</p>
                  <p className="text-xs text-muted-foreground">{pair.a.location}</p>
                  <p className="text-lg font-bold tabular-nums mt-1">{pair.a.claimedArea} <span className="text-xs font-normal text-muted-foreground">ha</span></p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] text-muted-foreground">Project B</p>
                  <p className="text-sm font-semibold mt-0.5">{pair.b.name}</p>
                  <p className="text-xs text-muted-foreground">{pair.b.location}</p>
                  <p className="text-lg font-bold tabular-nums mt-1">{pair.b.claimedArea} <span className="text-xs font-normal text-muted-foreground">ha</span></p>
                </div>
              </div>

              <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-destructive">Spatial Overlap</p>
                  <span className="text-2xl font-bold tabular-nums text-destructive">{pair.overlap}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-destructive transition-all duration-1000" style={{ width: `${pair.overlap}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Potential duplicate claim detected. Two projects claim overlapping restoration areas, which may result in double-counting of carbon benefits.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-warning/25 bg-warning/5 p-3">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-warning">Potential Duplicate Claim Detected</p>
                  <p className="text-[11px] text-muted-foreground">Manual review required to resolve boundary dispute.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onNavigate('verifier', pair.a.id)}>
                  Review <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
