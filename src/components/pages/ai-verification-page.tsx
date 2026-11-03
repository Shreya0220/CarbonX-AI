import { useState, useEffect } from 'react';
import {
  Brain,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  Copy,
  Layers,
  Radar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ConfidenceGauge } from '@/components/shared/confidence-gauge';
import { StatusBadge, SeverityBadge } from '@/components/shared/badges';
import { PageHeader, PrototypeNotice } from '@/components/shared/page-header';
import { getProject, projects } from '@/lib/mock-data';
import type { PageKey, Severity } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

type Stage = 'idle' | 'claim' | 'evidence' | 'analysis' | 'done';

export function AiVerificationPage({
  projectId,
  onNavigate,
}: {
  projectId?: string;
  onNavigate: (page: PageKey, projectId?: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(projectId || 'CX-2024-001');
  const project = getProject(selectedId) || projects[0];
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setStage('idle');
    setProgress(0);
  }, [selectedId]);

  const runVerification = () => {
    setStage('claim');
    setProgress(0);
    const steps: { stage: Stage; pct: number; delay: number }[] = [
      { stage: 'claim', pct: 15, delay: 500 },
      { stage: 'evidence', pct: 40, delay: 1200 },
      { stage: 'analysis', pct: 75, delay: 2000 },
      { stage: 'done', pct: 100, delay: 3000 },
    ];
    steps.forEach((s) => {
      setTimeout(() => {
        setStage(s.stage);
        setProgress(s.pct);
      }, s.delay);
    });
  };

  const evidenceChecks = [
    { label: 'Geographic boundary consistency', value: 78, status: 'pass' },
    { label: 'Uploaded evidence completeness', value: 65, status: 'warn' },
    { label: 'Historical imagery consistency', value: 54, status: 'fail' },
    { label: 'Reported area consistency', value: 61, status: 'warn' },
    { label: 'Project data consistency', value: 72, status: 'pass' },
  ];

  const aiModules = [
    { name: 'Claim Consistency Model', icon: Brain, status: 'Flagged', detail: 'Area mismatch detected (25 ha vs 18.7 ha)', color: 'text-warning' },
    { name: 'Anomaly Detection Model', icon: Radar, status: 'Active', detail: `${project.anomalies.length} anomalies detected`, color: 'text-destructive' },
    { name: 'Duplicate Claim Detection', icon: Layers, status: project.anomalies.some(a => a.type === 'Spatial Overlap') ? 'Flagged' : 'Clear', detail: project.anomalies.some(a => a.type === 'Spatial Overlap') ? '87% overlap with adjacent project' : 'No duplicates', color: project.anomalies.some(a => a.type === 'Spatial Overlap') ? 'text-destructive' : 'text-success' },
  ];

  const contributionData = [
    { factor: 'Area Mismatch', contribution: 32, color: 'hsl(var(--destructive))' },
    { factor: 'Spatial Overlap', contribution: 24, color: 'hsl(var(--warning))' },
    { factor: 'Evidence Completeness', contribution: 18, color: 'hsl(var(--info))' },
    { factor: 'Historical Consistency', contribution: 14, color: 'hsl(var(--accent))' },
    { factor: 'Data Quality', contribution: 12, color: 'hsl(var(--chart-4))' },
  ];

  const isRunning = stage !== 'idle' && stage !== 'done';

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Verification Engine"
        description="AI-assisted analysis of blue-carbon restoration claims using evidence consistency, anomaly detection, and duplicate claim detection."
        icon={Brain}
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

      {/* Workflow steps */}
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Step 1: Claim */}
        <Card className={cn('transition-all', stage === 'claim' && 'ring-2 ring-primary')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', stage === 'idle' ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground')}>1</span>
                <CardTitle className="text-sm">Project Claim</CardTitle>
              </div>
              {stage !== 'idle' && <CheckCircle2 className="h-4 w-4 text-success" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="rounded-lg bg-muted/40 p-2.5">
              <p className="text-[10px] text-muted-foreground">Claimed Restoration Area</p>
              <p className="text-lg font-bold tabular-nums">{project.claimedArea} <span className="text-xs font-normal text-muted-foreground">ha</span></p>
            </div>
            <div className="rounded-lg bg-muted/40 p-2.5">
              <p className="text-[10px] text-muted-foreground">Claimed Carbon Benefit</p>
              <p className="text-lg font-bold tabular-nums">{project.carbonBenefit.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">tCO2e</span></p>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Evidence */}
        <Card className={cn('transition-all', stage === 'evidence' && 'ring-2 ring-primary')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', stage === 'idle' || stage === 'claim' ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground')}>2</span>
                <CardTitle className="text-sm">Evidence Analysis</CardTitle>
              </div>
              {(stage === 'evidence' || stage === 'analysis' || stage === 'done') && <CheckCircle2 className="h-4 w-4 text-success" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {evidenceChecks.map((c) => (
              <div key={c.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate flex-1 mr-2">{c.label}</span>
                <span className={cn('font-semibold tabular-nums', c.status === 'pass' ? 'text-success' : c.status === 'warn' ? 'text-warning' : 'text-destructive')}>
                  {c.value}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Step 3: AI Analysis */}
        <Card className={cn('transition-all', stage === 'analysis' && 'ring-2 ring-primary')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', stage === 'idle' || stage === 'claim' || stage === 'evidence' ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground')}>3</span>
                <CardTitle className="text-sm">AI Analysis</CardTitle>
              </div>
              {stage === 'done' && <CheckCircle2 className="h-4 w-4 text-success" />}
              {isRunning && stage === 'analysis' && <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {aiModules.map((m) => (
              <div key={m.name} className="flex items-start gap-2">
                <m.icon className={cn('h-4 w-4 shrink-0 mt-0.5', m.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{m.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Step 4: Result */}
        <Card className={cn('transition-all', stage === 'done' && 'ring-2 ring-warning')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', stage === 'done' ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground')}>4</span>
                <CardTitle className="text-sm">Verification Result</CardTitle>
              </div>
              {stage === 'done' && <AlertTriangle className="h-4 w-4 text-warning" />}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {stage === 'done' ? (
              <div className="flex flex-col items-center text-center">
                <ConfidenceGauge value={project.aiConfidence} size={90} strokeWidth={8} label="Confidence" />
                <Badge className="mt-2 bg-warning/15 text-warning border-warning/25">Manual Review Required</Badge>
                <p className="text-[10px] text-muted-foreground mt-1.5">AI-assisted — not a final certification</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Brain className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">Run verification to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Run button + progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button onClick={runVerification} disabled={isRunning} className="h-11" size="lg">
              {isRunning ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : stage === 'done' ? (
                <>
                  <Play className="h-4 w-4" />
                  Re-run AI Verification
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run AI Verification
                </>
              )}
            </Button>
            {isRunning && (
              <div className="flex-1 flex items-center gap-3">
                <Progress value={progress} className="flex-1" />
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">{progress}%</span>
              </div>
            )}
            {stage === 'done' && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge className="bg-warning/15 text-warning border-warning/25">Manual Review Required</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {stage === 'done' && (
        <div className="space-y-4 animate-fade-up">
          {/* Confidence + status */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle className="text-base">Verification Confidence</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center">
                <ConfidenceGauge value={project.aiConfidence} size={160} strokeWidth={12} label="AI Confidence" sublabel="Decision Support" />
                <div className="mt-3 flex items-center gap-2">
                  <StatusBadge status={project.status} />
                  <Badge className="bg-warning/15 text-warning border-warning/25">Manual Review Required</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Risk factors */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Risk & Consistency Factors</CardTitle>
                <p className="text-xs text-muted-foreground">Factors contributing to the verification confidence score</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {([
                  { label: 'Claimed area mismatch', value: 75, severity: 'high', detail: 'Claimed 25 ha, evidence shows 18.7 ha' },
                  { label: 'Historical evidence inconsistency', value: 54, severity: 'medium', detail: 'Imagery does not match expected canopy density' },
                  { label: 'Potential spatial overlap', value: 87, severity: 'high', detail: '87% overlap with CX-2024-007' },
                  { label: 'Evidence completeness', value: 65, severity: 'medium', detail: 'Field survey report pending validation' },
                  { label: 'Data quality', value: 72, severity: 'low', detail: 'Project metadata mostly consistent' },
                ] as { label: string; value: number; severity: Severity; detail: string }[]).map((f) => (
                  <div key={f.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{f.label}</span>
                        <SeverityBadge severity={f.severity} />
                      </div>
                      <span className="text-sm font-bold tabular-nums">{f.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-1000', f.severity === 'high' ? 'bg-destructive' : f.severity === 'medium' ? 'bg-warning' : 'bg-success')}
                        style={{ width: `${f.value}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{f.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Explainable AI */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Explainable AI: Why is this claim flagged?</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Contribution of each factor to the flagging decision</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={contributionData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                  <YAxis type="category" dataKey="factor" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={130} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(v: number) => [`${v}% contribution`, '']}
                  />
                  <Bar dataKey="contribution" radius={[0, 6, 6, 0]} barSize={28}>
                    {contributionData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 rounded-lg border border-warning/25 bg-warning/5 p-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-warning">AI Explanation:</span> The claim is flagged primarily due to a 25.2% area mismatch between the claimed 25 ha and the evidence-consistent 18.7 ha, compounded by an 87% spatial overlap with an adjacent project. Historical imagery also shows lower-than-expected canopy density. These factors reduce verification confidence to {project.aiConfidence}%, indicating manual review is required.
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onNavigate('geo-evidence', project.id)}>
                  View Geo Evidence <ChevronRight className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onNavigate('verifier', project.id)}>
                  Send to Verifier <ChevronRight className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onNavigate('simulator', project.id)}>
                  What-If Simulator <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
