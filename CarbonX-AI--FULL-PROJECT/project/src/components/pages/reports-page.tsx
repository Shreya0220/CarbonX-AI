import { useState } from 'react';
import { FileText, Download, FileCheck, Brain, Leaf, Link2, Printer, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, ConfidenceBadge } from '@/components/shared/badges';
import { PageHeader, PrototypeNotice } from '@/components/shared/page-header';
import { projects, getProject } from '@/lib/mock-data';
import type { PageKey } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function ReportsPage({ onNavigate }: { onNavigate: (page: PageKey, projectId?: string) => void }) {
  const [selectedId, setSelectedId] = useState('CX-2024-001');
  const project = getProject(selectedId) || projects[0];
  const [reportType, setReportType] = useState('project');
  const [generated, setGenerated] = useState(false);

  const reportTypes = [
    { key: 'project', label: 'Project Verification Report', icon: FileCheck, desc: 'Full project profile with verification status' },
    { key: 'ai', label: 'AI Analysis Report', icon: Brain, desc: 'AI findings, confidence, and explainability' },
    { key: 'carbon', label: 'Carbon Estimation Summary', icon: Leaf, desc: 'Carbon estimation methodology and results' },
    { key: 'audit', label: 'Audit Trail Report', icon: Link2, desc: 'Blockchain audit record and integrity proof' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate professional verification reports for blue-carbon projects with AI findings, evidence summary, and audit references."
        icon={FileText}
      />
      <PrototypeNotice />

      {/* Report type selection */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((rt) => {
          const active = reportType === rt.key;
          return (
            <button
              key={rt.key}
              onClick={() => { setReportType(rt.key); setGenerated(false); }}
              className={cn(
                'flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all',
                active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
              )}
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                <rt.icon className="h-5 w-5" />
              </div>
              <p className={cn('text-sm font-semibold', active ? 'text-primary' : 'text-foreground')}>{rt.label}</p>
              <p className="text-xs text-muted-foreground">{rt.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Project selector + generate */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={selectedId} onValueChange={(v) => { setSelectedId(v); setGenerated(false); }}>
              <SelectTrigger className="w-full sm:w-72"><SelectValue /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setGenerated(true)} className="sm:ml-auto">
              <FileText className="h-4 w-4" /> Generate Report
            </Button>
            {generated && (
              <Button variant="outline" onClick={() => setGenerated(false)}>
                <Download className="h-4 w-4" /> Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report preview */}
      {generated && (
        <Card className="animate-fade-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <CardTitle className="text-base">Report Preview</CardTitle>
              </div>
              <Button variant="ghost" size="sm"><Printer className="h-3.5 w-3.5" /> Print</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-card p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      <Leaf className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-sm">CarbonX AI</span>
                  </div>
                  <h2 className="text-lg font-bold mt-2">
                    {reportTypes.find(r => r.key === reportType)?.label}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Generated on {new Date().toLocaleDateString()} · Prototype Report</p>
                </div>
                <StatusBadge status={project.status} />
              </div>

              {/* Project details */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Project Details</h3>
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Project Name</span><span className="font-medium">{project.name}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Project ID</span><span className="font-mono text-xs">{project.id}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Organization</span><span className="font-medium">{project.organization}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Location</span><span className="font-medium">{project.location}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Ecosystem</span><span className="font-medium">{project.ecosystem}</span></div>
                  <div className="flex justify-between border-b py-1"><span className="text-muted-foreground">Duration</span><span className="font-medium">{project.startDate} → {project.endDate}</span></div>
                </div>
              </div>

              {/* AI findings */}
              <div>
                <h3 className="text-sm font-semibold mb-2">AI Findings</h3>
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Verification Confidence</span>
                    <ConfidenceBadge value={project.aiConfidence} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status</span>
                    <Badge className="bg-warning/15 text-warning border-warning/25">Manual Review Required</Badge>
                  </div>
                  {project.anomalies.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-semibold mb-1">Detected Anomalies:</p>
                      <ul className="space-y-1">
                        {project.anomalies.map((a) => (
                          <li key={a.id} className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                            {a.type} ({a.severity}, {a.confidence}% confidence)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Evidence summary */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Evidence Summary</h3>
                <div className="rounded-lg border p-3 space-y-1.5">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Claimed Area</span><span className="font-medium">{project.claimedArea} ha</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Evidence-Consistent Area</span><span className="font-medium text-warning">{project.evidenceArea} ha</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Claimed Carbon Benefit</span><span className="font-medium">{project.carbonBenefit.toLocaleString()} tCO2e</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Evidence-Consistent Estimate</span><span className="font-medium">{project.estimatedCarbon.toLocaleString()} tCO2e</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Evidence Files</span><span className="font-medium">{project.evidenceFiles.length} files</span></div>
                </div>
              </div>

              {/* Verifier decision */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Verifier Decision</h3>
                <div className="rounded-lg border p-3">
                  {project.verifier ? (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Verifier</span><span className="font-medium">{project.verifier}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Decision</span><span className="font-medium text-success">Approved</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{project.verifiedAt?.split('T')[0]}</span></div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Pending human verifier review. AI recommendation: Manual review required.</p>
                  )}
                </div>
              </div>

              {/* Blockchain audit reference */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Blockchain Audit Reference</h3>
                <div className="rounded-lg border p-3 space-y-1.5">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Verification Hash</span><span className="font-mono text-xs">{project.blockchainHash}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Transaction Ref</span><span className="font-mono text-xs">{project.txRef}</span></div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  CarbonX AI — Prototype for Academic Demonstration · This report is AI-assisted and not a legally certified verification.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
