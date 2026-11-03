import { useState, useMemo } from 'react';
import { FlaskConical, Sliders, AlertTriangle, TrendingUp, Gauge, Copy, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ConfidenceGauge } from '@/components/shared/confidence-gauge';
import { PageHeader, PrototypeNotice } from '@/components/shared/page-header';
import type { PageKey } from '@/lib/types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { cn } from '@/lib/utils';

export function SimulatorPage({ onNavigate }: { onNavigate: (page: PageKey, projectId?: string) => void }) {
  const [area, setArea] = useState(25);
  const [vegetation, setVegetation] = useState(68);
  const [evidence, setEvidence] = useState(65);
  const [historical, setHistorical] = useState(54);
  const [dataQuality, setDataQuality] = useState(72);

  const [overlap, setOverlap] = useState(87);

  // Scenario 1: confidence calculation
  const confidence = useMemo(() => {
    const base = 50;
    const areaFactor = Math.max(0, (area / 25) * 15);
    const vegFactor = (vegetation / 100) * 20;
    const evidenceFactor = (evidence / 100) * 20;
    const histFactor = (historical / 100) * 15;
    const dqFactor = (dataQuality / 100) * 15;
    return Math.min(98, Math.max(15, Math.round(base + vegFactor + evidenceFactor + histFactor + dqFactor - (area > 30 ? (area - 30) * 0.8 : 0))));
  }, [area, vegetation, evidence, historical, dataQuality]);

  const carbonBenefit = useMemo(() => {
    return Math.round(area * 9.5 * 3 * (vegetation / 100 + 0.4) * (evidence / 100 + 0.3));
  }, [area, vegetation, evidence]);

  const riskLevel = confidence >= 80 ? 'Low' : confidence >= 60 ? 'Medium' : 'High';
  const riskColor = confidence >= 80 ? 'success' : confidence >= 60 ? 'warning' : 'destructive';
  const consistency = Math.round((vegetation + evidence + historical + dataQuality) / 4);

  // Scenario 2: duplicate risk
  const duplicateRisk = useMemo(() => {
    if (overlap < 20) return 'Low';
    if (overlap < 50) return 'Medium';
    if (overlap < 75) return 'High';
    return 'Critical';
  }, [overlap]);
  const dupConfidence = useMemo(() => Math.min(98, Math.round(40 + overlap * 0.6)), [overlap]);
  const reviewLevel = overlap < 20 ? 'Auto-approve eligible' : overlap < 50 ? 'Standard review' : overlap < 75 ? 'Senior review' : 'Escalated audit';

  // Chart data
  const confidenceData = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const a = 10 + i * 5;
      const c = Math.min(98, Math.max(15, Math.round(50 + (vegetation / 100) * 20 + (evidence / 100) * 20 + (historical / 100) * 15 + (dataQuality / 100) * 15 - (a > 30 ? (a - 30) * 0.8 : 0))));
      return { area: a, confidence: c };
    });
  }, [vegetation, evidence, historical, dataQuality]);

  const overlapData = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => {
      const o = 10 + i * 10;
      const c = Math.min(98, Math.round(40 + o * 0.6));
      return { overlap: o, confidence: c };
    });
  }, []);

  const sliders = [
    { label: 'Restoration Area', value: area, set: setArea, min: 10, max: 50, unit: 'ha' },
    { label: 'Vegetation Growth', value: vegetation, set: setVegetation, min: 0, max: 100, unit: '%' },
    { label: 'Evidence Completeness', value: evidence, set: setEvidence, min: 0, max: 100, unit: '%' },
    { label: 'Historical Consistency', value: historical, set: setHistorical, min: 0, max: 100, unit: '%' },
    { label: 'Data Quality', value: dataQuality, set: setDataQuality, min: 0, max: 100, unit: '%' },
  ];

  const reset = () => {
    setArea(25); setVegetation(68); setEvidence(65); setHistorical(54); setDataQuality(72);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="What-If Carbon Project Simulator"
        description="Interactively explore how changing restoration area, evidence quality, and overlap affect verification confidence and risk."
        icon={FlaskConical}
        actions={<Button variant="outline" size="sm" onClick={reset}><RotateCcw className="h-3.5 w-3.5" /> Reset</Button>}
      />
      <PrototypeNotice />

      {/* Scenario 1 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Scenario 1: Verification Confidence Simulator</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">How does changing restoration area or evidence quality affect the verification result?</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sliders */}
            <div className="space-y-4">
              {sliders.map((s) => (
                <div key={s.label} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{s.label}</span>
                    <span className="text-sm font-bold tabular-nums text-primary">{s.value}{s.unit}</span>
                  </div>
                  <Slider value={[s.value]} min={s.min} max={s.max} step={1} onValueChange={(v) => s.set(v[0])} />
                  <div className="flex justify-between text-[10px] text-muted-foreground/60">
                    <span>{s.min}{s.unit}</span><span>{s.max}{s.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center rounded-xl border bg-card p-4">
                  <ConfidenceGauge value={confidence} size={120} strokeWidth={10} label="Confidence" />
                  <Badge className={cn('mt-2', riskColor === 'success' ? 'bg-success/15 text-success border-success/25' : riskColor === 'warning' ? 'bg-warning/15 text-warning border-warning/25' : 'bg-destructive/15 text-destructive border-destructive/25')}>
                    {riskLevel} Risk
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Estimated Carbon Benefit</p>
                    <p className="text-xl font-bold tabular-nums text-primary">{carbonBenefit.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">tCO2e</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Project Consistency</p>
                    <p className="text-xl font-bold tabular-nums">{consistency}%</p>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                      <div className={cn('h-full rounded-full transition-all duration-500', consistency >= 75 ? 'bg-success' : consistency >= 60 ? 'bg-warning' : 'bg-destructive')} style={{ width: `${consistency}%` }} />
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Risk Level</p>
                    <p className={cn('text-xl font-bold', riskColor === 'success' ? 'text-success' : riskColor === 'warning' ? 'text-warning' : 'text-destructive')}>{riskLevel}</p>
                  </div>
                </div>
              </div>

              {/* Confidence vs area chart */}
              <div>
                <p className="text-xs font-semibold mb-1">Confidence vs. Restoration Area</p>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={confidenceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="simConf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="area" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" unit="ha" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <ReferenceLine x={area} stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="confidence" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#simConf)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario 2 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-base">Scenario 2: Duplicate Claim Scenario</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">How does spatial overlap percentage affect duplicate risk and required review level?</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Spatial Overlap</span>
                  <span className="text-sm font-bold tabular-nums text-destructive">{overlap}%</span>
                </div>
                <Slider value={[overlap]} min={10} max={95} step={1} onValueChange={(v) => setOverlap(v[0])} />
                <div className="flex justify-between text-[10px] text-muted-foreground/60"><span>10%</span><span>95%</span></div>
              </div>

              {/* Overlap visualization */}
              <div className="relative h-48 rounded-xl border bg-muted/20 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-32 w-32">
                    <div className="absolute inset-0 rounded-full border-2 border-info/40 bg-info/10" />
                    <div
                      className="absolute inset-0 rounded-full border-2 border-destructive/40 bg-destructive/10 transition-all duration-500"
                      style={{ transform: `translateX(${overlap * 0.8}px)`, opacity: 0.3 + overlap / 100 * 0.7 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold tabular-nums">{overlap}%</span>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-3 flex gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-info/60" /> Project A</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive/60" /> Project B</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Duplicate Risk</span>
                  <Badge className={cn(
                    duplicateRisk === 'Critical' ? 'bg-destructive/20 text-destructive border-destructive/40' :
                    duplicateRisk === 'High' ? 'bg-destructive/15 text-destructive border-destructive/25' :
                    duplicateRisk === 'Medium' ? 'bg-warning/15 text-warning border-warning/25' :
                    'bg-success/15 text-success border-success/25'
                  )}>{duplicateRisk}</Badge>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-500', duplicateRisk === 'Critical' || duplicateRisk === 'High' ? 'bg-destructive' : duplicateRisk === 'Medium' ? 'bg-warning' : 'bg-success')} style={{ width: `${overlap}%` }} />
                </div>
              </div>

              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Verification Confidence</p>
                <p className="text-xl font-bold tabular-nums">{dupConfidence}%</p>
              </div>

              <div className="rounded-xl border border-warning/25 bg-warning/5 p-3">
                <p className="text-xs text-muted-foreground">Required Review Level</p>
                <p className="text-sm font-semibold text-warning mt-0.5">{reviewLevel}</p>
              </div>

              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={overlapData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="overlap" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <ReferenceLine x={overlap} stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="confidence" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
