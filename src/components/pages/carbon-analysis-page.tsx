import { useState } from 'react';
import { Leaf, Calculator, TrendingUp, BarChart3, Info, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ConfidenceBadge } from '@/components/shared/badges';
import { PageHeader, PrototypeNotice } from '@/components/shared/page-header';
import { carbonTrendData, carbonByProjectData, projects, getProject } from '@/lib/mock-data';
import type { PageKey } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export function CarbonAnalysisPage({
  projectId,
  onNavigate,
}: {
  projectId?: string;
  onNavigate: (page: PageKey, projectId?: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(projectId || 'CX-2024-001');
  const project = getProject(selectedId) || projects[0];
  const [area, setArea] = useState(project.claimedArea);
  const [biomass, setBiomass] = useState(72);
  const [soilCarbon, setSoilCarbon] = useState(65);
  const [vegetation, setVegetation] = useState(68);
  const [duration, setDuration] = useState(3);

  // Simple estimation formula for prototype
  const baseRate = 9.5; // tCO2e/ha/year
  const estimatedCarbon = Math.round(area * baseRate * duration * (biomass / 100 + 0.5) * (soilCarbon / 100 + 0.5) * (vegetation / 100 + 0.5));
  const confidence = Math.min(95, Math.round((biomass + soilCarbon + vegetation) / 3 * 0.9 + 10));

  const flowSteps = [
    { label: 'Project Data', icon: Leaf, detail: `${area} ha · ${duration} yr` },
    { label: 'Environmental Metrics', icon: TrendingUp, detail: `Biomass ${biomass}% · Soil ${soilCarbon}%` },
    { label: 'Carbon Estimation Engine', icon: Calculator, detail: 'AI-assisted model' },
    { label: 'Estimated Carbon Benefit', icon: BarChart3, detail: `${estimatedCarbon.toLocaleString()} tCO2e` },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carbon Analysis"
        description="AI-assisted carbon estimation for blue-carbon restoration projects using environmental parameters and vegetation indicators."
        icon={Leaf}
        actions={
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <PrototypeNotice />

      {/* Calculation flow */}
      <Card>
        <CardHeader><CardTitle className="text-base">Methodology-Inspired Calculation Flow</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 lg:gap-3 flex-1">
                <div className="flex items-center gap-3 rounded-xl border bg-card p-3 flex-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">{step.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{step.detail}</p>
                  </div>
                </div>
                {i < flowSteps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden lg:block" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Inputs */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Estimation Inputs</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between"><Label className="text-xs">Restoration Area</Label><span className="text-xs font-bold tabular-nums">{area} ha</span></div>
              <Slider value={[area]} min={5} max={50} step={1} onValueChange={(v) => setArea(v[0])} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between"><Label className="text-xs">Biomass Parameters</Label><span className="text-xs font-bold tabular-nums">{biomass}%</span></div>
              <Slider value={[biomass]} min={0} max={100} step={1} onValueChange={(v) => setBiomass(v[0])} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between"><Label className="text-xs">Soil Carbon Parameters</Label><span className="text-xs font-bold tabular-nums">{soilCarbon}%</span></div>
              <Slider value={[soilCarbon]} min={0} max={100} step={1} onValueChange={(v) => setSoilCarbon(v[0])} />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between"><Label className="text-xs">Vegetation Indicators</Label><span className="text-xs font-bold tabular-nums">{vegetation}%</span></div>
              <Slider value={[vegetation]} min={0} max={100} step={1} onValueChange={(v) => setVegetation(v[0])} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Project Duration (years)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value) || 1)} />
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Estimated Carbon Output</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 p-4 border border-primary/15">
                <p className="text-xs text-muted-foreground">Estimated Carbon Storage</p>
                <p className="text-2xl font-bold tabular-nums text-primary mt-1">{estimatedCarbon.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">tCO2e</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Estimated Sequestration Rate</p>
                <p className="text-2xl font-bold tabular-nums mt-1">{(estimatedCarbon / (area * duration)).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">tCO2e/ha/year</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Calculation Confidence</p>
                <div className="mt-1"><ConfidenceBadge value={confidence} /></div>
                <p className="text-xs text-muted-foreground mt-1">AI-assisted</p>
              </div>
            </div>

            <div className="rounded-lg border border-info/25 bg-info/5 p-3 flex gap-2">
              <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-info">Disclaimer:</span> Prototype estimation for demonstration; not a certified carbon accounting result. Actual sequestration depends on species, site conditions, and long-term monitoring.
              </p>
            </div>

            {/* Carbon trend chart */}
            <div>
              <p className="text-sm font-semibold mb-2">Projected Carbon Trend</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={carbonTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="carbon" name="Carbon (tCO2e)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Area vs Estimated Carbon Benefit</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={carbonByProjectData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
                <Bar dataKey="claimed" name="Claimed" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="estimated" name="Estimated" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Project Comparison — Carbon Benefit</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {projects.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-24 shrink-0">
                  <p className="text-xs font-medium truncate">{p.name.split(' ')[0]}</p>
                </div>
                <div className="flex-1 h-6 rounded-md bg-muted overflow-hidden relative">
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                    style={{ width: `${(p.estimatedCarbon / 4000) * 100}%` }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold tabular-nums text-foreground">
                    {p.estimatedCarbon.toLocaleString()}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{p.ecosystem}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
