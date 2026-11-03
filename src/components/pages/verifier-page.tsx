import { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  FileQuestion,
  Clock,
  Brain,
  MapPin,
  Leaf,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StatusBadge, ConfidenceBadge, SeverityBadge } from '@/components/shared/badges';
import { ConfidenceGauge } from '@/components/shared/confidence-gauge';
import { CoastalMap } from '@/components/shared/coastal-map';
import { PageHeader, PrototypeNotice } from '@/components/shared/page-header';
import { projects, projectMarkers, getProject } from '@/lib/mock-data';
import type { PageKey, VerificationEvent } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function VerifierPage({
  projectId,
  onNavigate,
}: {
  projectId?: string;
  onNavigate: (page: PageKey, projectId?: string) => void;
}) {
  const reviewProjects = projects.filter((p) => p.status === 'review' || p.status === 'suspicious');
  const [selectedId, setSelectedId] = useState(projectId || reviewProjects[0]?.id || 'CX-2024-001');
  const project = getProject(selectedId) || projects[0];
  const [decision, setDecision] = useState<'none' | 'approve' | 'reject' | 'more-evidence'>('none');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const marker = projectMarkers.find((m) => m.id === project.id);
  const markers = marker ? [marker, ...projectMarkers.filter((m) => m.id !== project.id)] : projectMarkers;

  const timelineSteps = ['Submitted', 'AI Analyzed', 'Flagged', 'Human Review', 'Final Decision'];
  const currentStep = 3; // Human review

  const handleDecision = (d: typeof decision) => {
    setDecision(d);
  };

  const submit = () => {
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Verification Center"
        description="Human-in-the-loop verification dashboard. AI provides decision support — the human verifier makes the final workflow decision."
        icon={FileCheck}
        actions={
          <Select value={selectedId} onValueChange={(v) => { setSelectedId(v); setDecision('none'); setSubmitted(false); }}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              {reviewProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <PrototypeNotice />

      {/* Timeline */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {timelineSteps.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors',
                      i < currentStep ? 'bg-success text-success-foreground' :
                      i === currentStep ? 'bg-warning text-warning-foreground ring-4 ring-warning/20' :
                      'bg-muted text-muted-foreground'
                    )}
                  >
                    {i < currentStep ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={cn('text-[10px] font-medium whitespace-nowrap', i <= currentStep ? 'text-foreground' : 'text-muted-foreground')}>{step}</span>
                </div>
                {i < timelineSteps.length - 1 && (
                  <div className={cn('h-0.5 flex-1 mx-2 rounded-full', i < currentStep ? 'bg-success' : 'bg-muted')} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {submitted ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full',
                decision === 'approve' ? 'bg-success/10 text-success' :
                decision === 'reject' ? 'bg-destructive/10 text-destructive' :
                'bg-warning/10 text-warning'
              )}>
                {decision === 'approve' ? <CheckCircle2 className="h-8 w-8" /> :
                 decision === 'reject' ? <XCircle className="h-8 w-8" /> :
                 <FileQuestion className="h-8 w-8" />}
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {decision === 'approve' ? 'Project Approved' :
                   decision === 'reject' ? 'Project Rejected' :
                   'More Evidence Requested'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  {decision === 'approve' ? 'The verification decision has been recorded. An audit trail entry will be created on the blockchain.' :
                   decision === 'reject' ? 'The rejection has been recorded with the provided justification.' :
                   'A request for additional evidence has been sent to the project owner.'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setSubmitted(false); setDecision('none'); }}>Review Another</Button>
                <Button onClick={() => onNavigate('blockchain', project.id)}>View Audit Record <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Project info + AI findings */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Project Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.id} · {project.organization}</p>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-medium">{project.location}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Ecosystem</span><span className="font-medium">{project.ecosystem}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Claimed Area</span><span className="font-medium">{project.claimedArea} ha</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Evidence Area</span><span className="font-medium text-warning">{project.evidenceArea} ha</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Claimed Carbon</span><span className="font-medium">{project.carbonBenefit.toLocaleString()} tCO2e</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Est. Carbon</span><span className="font-medium">{project.estimatedCarbon.toLocaleString()} tCO2e</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">AI Confidence</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <ConfidenceGauge value={project.aiConfidence} size={120} label="AI Confidence" sublabel="Decision Support" />
                <p className="text-[10px] text-muted-foreground mt-2 text-center">AI is advisory only. Human verifier makes the final decision.</p>
              </CardContent>
            </Card>
          </div>

          {/* AI findings + evidence */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">AI Findings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {project.anomalies.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" /> No anomalies detected by AI.
                  </div>
                ) : (
                  project.anomalies.map((a) => (
                    <div key={a.id} className="flex items-start gap-2.5 rounded-lg border p-3">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold">{a.type}</p>
                          <div className="flex gap-1.5"><SeverityBadge severity={a.severity} /><ConfidenceBadge value={a.confidence} /></div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{a.description}</p>
                      </div>
                    </div>
                  ))
                )}
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs font-semibold mb-1.5">Explainability Summary</p>
                  <p className="text-[11px] text-muted-foreground">
                    {project.aiConfidence < 70
                      ? 'AI confidence is below the auto-approve threshold. Key factors: area mismatch, spatial overlap, and historical imagery inconsistency. Manual review recommended.'
                      : 'AI confidence is within acceptable range. No critical anomalies detected.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <CardTitle className="text-base">Map & Evidence</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CoastalMap markers={markers} selectedId={project.id} className="h-[200px]" showOverlaps={project.anomalies.some(a => a.type.includes('Overlap'))} />
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold">Evidence Files ({project.evidenceFiles.length})</p>
                  {project.evidenceFiles.slice(0, 3).map((f) => (
                    <div key={f.id} className="flex items-center justify-between text-xs">
                      <span className="truncate">{f.name}</span>
                      <Badge variant="outline" className={cn('text-[10px] shrink-0', f.status === 'consistent' ? 'border-success/25 text-success' : f.status === 'inconsistent' ? 'border-destructive/25 text-destructive' : 'border-warning/25 text-warning')}>{f.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Carbon estimation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Carbon Estimation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Claimed</p>
                  <p className="text-lg font-bold tabular-nums">{project.carbonBenefit.toLocaleString()} tCO2e</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Evidence-Consistent</p>
                  <p className="text-lg font-bold tabular-nums text-primary">{project.estimatedCarbon.toLocaleString()} tCO2e</p>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Discrepancy</p>
                  <p className="text-lg font-bold tabular-nums text-destructive">{Math.round((1 - project.estimatedCarbon / project.carbonBenefit) * 100)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision panel */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Verifier Decision</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() => handleDecision('approve')}
                  className={cn('flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all', decision === 'approve' ? 'border-success bg-success/5' : 'border-border hover:border-success/40')}
                >
                  <CheckCircle2 className={cn('h-6 w-6', decision === 'approve' ? 'text-success' : 'text-muted-foreground')} />
                  <span className="text-sm font-semibold">Approve</span>
                </button>
                <button
                  onClick={() => handleDecision('reject')}
                  className={cn('flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all', decision === 'reject' ? 'border-destructive bg-destructive/5' : 'border-border hover:border-destructive/40')}
                >
                  <XCircle className={cn('h-6 w-6', decision === 'reject' ? 'text-destructive' : 'text-muted-foreground')} />
                  <span className="text-sm font-semibold">Reject</span>
                </button>
                <button
                  onClick={() => handleDecision('more-evidence')}
                  className={cn('flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all', decision === 'more-evidence' ? 'border-warning bg-warning/5' : 'border-border hover:border-warning/40')}
                >
                  <FileQuestion className={cn('h-6 w-6', decision === 'more-evidence' ? 'text-warning' : 'text-muted-foreground')} />
                  <span className="text-sm font-semibold">Request More Evidence</span>
                </button>
              </div>

              {decision !== 'none' && (
                <div className="space-y-2 animate-fade-up">
                  <Label>Decision Notes / Justification</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                      decision === 'approve' ? 'Explain why this project meets verification standards...' :
                      decision === 'reject' ? 'Explain why this claim is rejected...' :
                      'Specify what additional evidence is required...'
                    }
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDecision('none')}>Cancel</Button>
                    <Button onClick={submit} className={decision === 'approve' ? 'bg-success hover:bg-success/90' : decision === 'reject' ? 'bg-destructive hover:bg-destructive/90' : 'bg-warning hover:bg-warning/90'}>
                      Confirm Decision
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
