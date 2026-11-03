import { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Link2,
  Download,
  Brain,
  Leaf,
  Clock,
  CheckCircle2,
  XCircle,
  Circle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, ConfidenceBadge, SeverityBadge } from '@/components/shared/badges';
import { ConfidenceGauge } from '@/components/shared/confidence-gauge';
import { CoastalMap } from '@/components/shared/coastal-map';
import { projectMarkers, getProject } from '@/lib/mock-data';
import type { PageKey, EvidenceFile } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ProjectDetailsPage({
  projectId,
  onNavigate,
}: {
  projectId: string;
  onNavigate: (page: PageKey, projectId?: string) => void;
}) {
  const project = getProject(projectId) || getProject('CX-2024-001')!;
  const [activeTab, setActiveTab] = useState<'summary' | 'evidence' | 'ai' | 'carbon' | 'anomalies' | 'history' | 'audit'>('summary');

  const tabs = [
    { key: 'summary', label: 'Summary' },
    { key: 'evidence', label: 'Evidence' },
    { key: 'ai', label: 'AI Analysis' },
    { key: 'carbon', label: 'Carbon' },
    { key: 'anomalies', label: 'Anomalies' },
    { key: 'history', label: 'History' },
    { key: 'audit', label: 'Audit' },
  ] as const;

  const marker = projectMarkers.find((m) => m.id === project.id);
  const markers = marker ? [marker, ...projectMarkers.filter((m) => m.id !== project.id)] : projectMarkers;

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('projects')}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Leaf className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <span className="font-mono">{project.id}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{project.location}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{project.organization}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ConfidenceGauge value={project.aiConfidence} size={80} strokeWidth={8} label="AI Confidence" />
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={() => onNavigate('ai-verification', project.id)}>
              <Brain className="h-4 w-4" /> AI Verification
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigate('verifier', project.id)}>
              Review
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-thin border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'summary' && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Project Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Ecosystem</span><span className="font-medium">{project.ecosystem}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Start Date</span><span className="font-medium">{project.startDate}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">End Date</span><span className="font-medium">{project.endDate}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Last Updated</span><span className="font-medium">{project.lastUpdated}</span></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Latitude</span><span className="font-mono text-xs">{project.lat}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Longitude</span><span className="font-mono text-xs">{project.lng}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Verifier</span><span className="font-medium">{project.verifier || 'Unassigned'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Verified At</span><span className="font-medium">{project.verifiedAt ? project.verifiedAt.split('T')[0] : '—'}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Claimed Metrics</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Claimed Restoration Area</p>
                <p className="text-2xl font-bold tabular-nums">{project.claimedArea} <span className="text-sm font-normal text-muted-foreground">ha</span></p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Evidence-Consistent Area</p>
                <p className="text-2xl font-bold tabular-nums text-warning">{project.evidenceArea} <span className="text-sm font-normal text-muted-foreground">ha</span></p>
              </div>
              {project.claimedArea !== project.evidenceArea && (
                <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2.5">
                  <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                  <p className="text-xs text-warning font-medium">Claim–evidence mismatch detected</p>
                </div>
              )}
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Claimed Carbon Benefit</p>
                <p className="text-2xl font-bold tabular-nums">{project.carbonBenefit.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">tCO2e</span></p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Evidence-Consistent Estimate</p>
                <p className="text-2xl font-bold tabular-nums">{project.estimatedCarbon.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">tCO2e</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'evidence' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Evidence Files ({project.evidenceFiles.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {project.evidenceFiles.map((file: EvidenceFile) => (
              <div key={file.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  {file.type === 'satellite' ? <MapPin className="h-5 w-5 text-info" /> :
                   file.type === 'image' ? <ImageIcon className="h-5 w-5 text-accent" /> :
                   file.type === 'report' ? <FileText className="h-5 w-5 text-primary" /> :
                   <FileText className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.size} · Uploaded {file.uploadedAt}</p>
                </div>
                <Badge variant={file.status === 'consistent' ? 'default' : file.status === 'inconsistent' ? 'destructive' : 'secondary'}
                  className={file.status === 'consistent' ? 'bg-success/15 text-success border-success/25' : file.status === 'inconsistent' ? 'bg-destructive/15 text-destructive border-destructive/25' : ''}>
                  {file.status}
                </Badge>
                <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'ai' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">AI Analysis Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-center py-4">
                <ConfidenceGauge value={project.aiConfidence} size={140} label="Verification Confidence" sublabel="AI-assisted" />
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Geographic Boundary Consistency', value: 78 },
                  { label: 'Evidence Completeness', value: 65 },
                  { label: 'Historical Imagery Consistency', value: 54 },
                  { label: 'Reported Area Consistency', value: 61 },
                  { label: 'Project Data Consistency', value: 72 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-semibold tabular-nums">{item.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${item.value >= 75 ? 'bg-success' : item.value >= 60 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">AI Modules</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Claim Consistency Model', status: 'Flagged', detail: 'Area mismatch between claim and evidence', icon: Brain, color: 'text-warning' },
                { name: 'Anomaly Detection Model', status: 'Active', detail: `${project.anomalies.length} anomalies detected`, icon: AlertTriangle, color: 'text-destructive' },
                { name: 'Duplicate Claim Detection', status: project.anomalies.some(a => a.type === 'Spatial Overlap') ? 'Flagged' : 'Clear', detail: project.anomalies.some(a => a.type === 'Spatial Overlap') ? 'Spatial overlap detected' : 'No duplicates found', icon: Link2, color: project.anomalies.some(a => a.type === 'Spatial Overlap') ? 'text-destructive' : 'text-success' },
              ].map((m) => (
                <div key={m.name} className="flex items-start gap-3 rounded-lg border p-3">
                  <m.icon className={cn('h-5 w-5 shrink-0', m.color)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{m.name}</p>
                      <Badge variant="outline" className={cn('text-xs', m.color)}>{m.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.detail}</p>
                  </div>
                </div>
              ))}
              <Button className="w-full" onClick={() => onNavigate('ai-verification', project.id)}>
                <Brain className="h-4 w-4" /> Run Full AI Verification
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'carbon' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Carbon Estimation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Claimed Carbon Benefit</p>
                <p className="text-2xl font-bold tabular-nums">{project.carbonBenefit.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">tCO2e</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Evidence-Consistent Estimate</p>
                <p className="text-2xl font-bold tabular-nums text-primary">{project.estimatedCarbon.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">tCO2e</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Calculation Confidence</p>
                <p className="text-2xl font-bold tabular-nums">{project.aiConfidence}%</p>
              </div>
            </div>
            <div className="rounded-lg border border-info/25 bg-info/5 p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-info">Note:</span> Prototype estimation for demonstration; not a certified carbon accounting result.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'anomalies' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Anomaly Findings ({project.anomalies.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {project.anomalies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-10 w-10 text-success/50 mb-2" />
                <p className="text-sm text-muted-foreground">No anomalies detected for this project.</p>
              </div>
            ) : (
              project.anomalies.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-sm font-semibold">{a.type}</p>
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={a.severity} />
                        <ConfidenceBadge value={a.confidence} />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">Detected {a.detectedAt} · Status: {a.status}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Verification History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-0">
              {project.history.map((event, i) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {event.status === 'complete' ? <CheckCircle2 className="h-5 w-5 text-success" /> :
                     event.status === 'flagged' ? <XCircle className="h-5 w-5 text-destructive" /> :
                     <Circle className="h-5 w-5 text-muted-foreground" />}
                    {i < project.history.length - 1 && <div className="w-px h-8 bg-border" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-semibold">{event.stage}</p>
                    <p className="text-xs text-muted-foreground">{event.actor} · {event.timestamp}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Blockchain Audit Record</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Link2 className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Verification Hash</p>
                <p className="text-sm font-mono truncate">{project.blockchainHash}</p>
              </div>
              <Badge variant="outline" className="capitalize">{project.status}</Badge>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Link2 className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Transaction Reference</p>
                <p className="text-sm font-mono truncate">{project.txRef}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => onNavigate('blockchain', project.id)}>
              View in Blockchain Audit Explorer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <Card>
        <CardHeader><CardTitle className="text-base">Location & Map</CardTitle></CardHeader>
        <CardContent>
          <CoastalMap markers={markers} selectedId={project.id} className="h-[280px]" showOverlaps={project.anomalies.some(a => a.type.includes('Overlap') || a.type.includes('Duplicate'))} />
        </CardContent>
      </Card>
    </div>
  );
}
