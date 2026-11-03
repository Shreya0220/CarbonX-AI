import { useState } from 'react';
import {
  FolderKanban,
  Clock,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Leaf,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, ConfidenceBadge } from '@/components/shared/badges';
import { CoastalMap } from '@/components/shared/coastal-map';
import { PageHeader, PrototypeNotice } from '@/components/shared/page-header';
import { useCountUp } from '@/hooks/use-count-up';
import { projects, projectMarkers, alerts, verificationTrendData } from '@/lib/mock-data';
import type { PageKey, ProjectMarker } from '@/lib/types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

function KpiCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  trendUp,
  color,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  color: string;
  delay?: number;
}) {
  const animated = useCountUp(value, 1000, 0);
  return (
    <Card
      className="relative overflow-hidden animate-fade-up hover:shadow-lg transition-shadow group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute top-0 left-0 h-full w-1 ${color}`} />
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color} bg-opacity-10`}>
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span
              className={`flex items-center gap-0.5 text-xs font-semibold ${
                trendUp ? 'text-success' : 'text-destructive'
              }`}
            >
              {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tabular-nums tracking-tight">
            {Math.round(animated).toLocaleString()}
            {unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewPage({ onNavigate }: { onNavigate: (page: PageKey, projectId?: string) => void }) {
  const [selectedMarker, setSelectedMarker] = useState<string | undefined>(undefined);
  const selectedProject = projects.find((p) => p.id === selectedMarker);
  const markers: ProjectMarker[] = projectMarkers;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview Dashboard"
        description="Real-time view of blue-carbon verification activity, AI alerts, and project status."
        actions={<Button variant="outline" size="sm" onClick={() => onNavigate('ai-verification')}>Run Verification</Button>}
      />
      <PrototypeNotice />

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={FolderKanban} label="Total Projects" value={124} trend="+12%" trendUp color="bg-info text-info" delay={0} />
        <KpiCard icon={Clock} label="Under Review" value={18} trend="+3" trendUp color="bg-warning text-warning" delay={50} />
        <KpiCard icon={ShieldCheck} label="Verified Projects" value={86} trend="+8%" trendUp color="bg-success text-success" delay={100} />
        <KpiCard icon={AlertTriangle} label="Flagged Claims" value={11} trend="+2" trendUp={false} color="bg-destructive text-destructive" delay={150} />
        <KpiCard icon={TrendingUp} label="Avg. Confidence" value={82} unit="%" trend="+4%" trendUp color="bg-primary text-primary" delay={200} />
        <KpiCard icon={Leaf} label="Carbon Benefit" value={48320} unit="tCO2e" trend="+6.2%" trendUp color="bg-accent text-accent" delay={250} />
      </div>

      {/* Map + Trend chart */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Map */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Digital Coastal Project Map</CardTitle>
              <span className="text-xs text-muted-foreground">{projects.length} active projects</span>
            </div>
          </CardHeader>
          <CardContent className="p-0 px-4 pb-4">
            <CoastalMap
              markers={markers}
              onMarkerClick={(id) => setSelectedMarker(id)}
              selectedId={selectedMarker}
              className="h-[320px]"
              showOverlaps
            />
            {selectedProject && (
              <div className="mt-3 flex items-center justify-between rounded-lg border bg-muted/30 p-3 animate-scale-in">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{selectedProject.name}</p>
                    <StatusBadge status={selectedProject.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedProject.location} · {selectedProject.claimedArea} ha · {selectedProject.ecosystem}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ConfidenceBadge value={selectedProject.aiConfidence} />
                  <Button size="sm" variant="ghost" onClick={() => onNavigate('project-details', selectedProject.id)}>
                    View <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trend chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Verification Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Monthly submitted, verified, and flagged claims</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={verificationTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--info))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--info))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cVerified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
                <Area type="monotone" dataKey="submitted" name="Submitted" stroke="hsl(var(--info))" strokeWidth={2} fill="url(#cSubmitted)" />
                <Area type="monotone" dataKey="verified" name="Verified" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#cVerified)" />
                <Area type="monotone" dataKey="flagged" name="Flagged" stroke="hsl(var(--destructive))" strokeWidth={2} fill="url(#cFlagged)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts + Recent projects */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent AI Alerts</CardTitle>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">{alerts.length} active</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.slice(0, 5).map((alert, i) => (
              <div
                key={alert.id}
                className="flex gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors cursor-pointer animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => onNavigate('risk')}
              >
                <span
                  className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                    alert.severity === 'critical' ? 'bg-destructive' : alert.severity === 'high' ? 'bg-warning' : 'bg-info'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{alert.type}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{alert.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent projects table */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Projects</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('projects')}>
                View all <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2 font-semibold">Project</th>
                    <th className="px-4 py-2 font-semibold">Location</th>
                    <th className="px-4 py-2 font-semibold">Area</th>
                    <th className="px-4 py-2 font-semibold">AI Conf.</th>
                    <th className="px-4 py-2 font-semibold">Status</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 6).map((p) => (
                    <tr
                      key={p.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => onNavigate('project-details', p.id)}
                    >
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-xs">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.id}</p>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.location}</td>
                      <td className="px-4 py-2.5 text-xs tabular-nums">{p.claimedArea} ha</td>
                      <td className="px-4 py-2.5"><ConfidenceBadge value={p.aiConfidence} /></td>
                      <td className="px-4 py-2.5"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-2.5">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground/60 pt-2">
        CarbonX AI — Prototype for Academic Demonstration
      </p>
    </div>
  );
}
