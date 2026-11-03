import { useState } from 'react';
import { Plus, Search, Filter, FileText, MapPin, Calendar, Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, ConfidenceBadge } from '@/components/shared/badges';
import { PageHeader, PrototypeNotice } from '@/components/shared/page-header';
import { projects } from '@/lib/mock-data';
import type { PageKey, VerificationStatus, EcosystemType } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const statusFilters: { key: VerificationStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'verified', label: 'Verified' },
  { key: 'review', label: 'Pending' },
  { key: 'suspicious', label: 'Suspicious' },
  { key: 'rejected', label: 'Rejected' },
];

export function ProjectsPage({ onNavigate }: { onNavigate: (page: PageKey, projectId?: string) => void }) {
  const [filter, setFilter] = useState<VerificationStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filtered = projects.filter(
    (p) =>
      (filter === 'all' || p.status === filter) &&
      (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Registry of all blue-carbon restoration projects submitted for AI-assisted verification."
        icon={Plus}
        actions={
          <Button size="sm" onClick={() => { setShowForm(true); setSubmitted(false); }}>
            <Plus className="h-4 w-4" /> Register New Project
          </Button>
        }
      />
      <PrototypeNotice />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                filter === f.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Project ID</th>
                  <th className="px-4 py-3 font-semibold">Project Name</th>
                  <th className="px-4 py-3 font-semibold">Organization</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Ecosystem</th>
                  <th className="px-4 py-3 font-semibold">Claimed Area</th>
                  <th className="px-4 py-3 font-semibold">Est. Carbon</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">AI Conf.</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => onNavigate('project-details', p.id)}
                  >
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.id}</td>
                    <td className="px-4 py-3 font-medium text-xs">{p.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.organization}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.location}</td>
                    <td className="px-4 py-3"><span className="text-xs rounded-md bg-muted px-2 py-0.5">{p.ecosystem}</span></td>
                    <td className="px-4 py-3 text-xs tabular-nums">{p.claimedArea} ha</td>
                    <td className="px-4 py-3 text-xs tabular-nums">{p.estimatedCarbon.toLocaleString()} tCO2e</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3"><ConfidenceBadge value={p.aiConfidence} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.lastUpdated}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No projects match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New project dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">Project Submitted</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Your project has been submitted for AI-assisted verification. You will be notified once the analysis is complete.
                </p>
              </div>
              <Button onClick={() => setShowForm(false)}>Close</Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Register New Project</DialogTitle>
                <DialogDescription>Submit a blue-carbon restoration project for AI-assisted verification.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Project Name</Label>
                    <Input placeholder="e.g. Mangrove Restoration Initiative" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Organization</Label>
                    <Input placeholder="e.g. GreenCoast Foundation" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Ecosystem Type</Label>
                    <Select defaultValue="Mangrove">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mangrove">Mangrove</SelectItem>
                        <SelectItem value="Seagrass">Seagrass</SelectItem>
                        <SelectItem value="Salt Marsh">Salt Marsh</SelectItem>
                        <SelectItem value="Kelp Forest">Kelp Forest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Location</Label>
                    <Input placeholder="e.g. Odisha, India" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Latitude</Label>
                    <Input type="number" placeholder="20.4683" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Longitude</Label>
                    <Input type="number" placeholder="85.9382" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Claimed Restoration Area (ha)</Label>
                    <Input type="number" placeholder="25" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estimated Carbon Benefit (tCO2e)</Label>
                    <Input type="number" placeholder="2850" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Project Start Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Project End Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the restoration project, methodology, and objectives..." rows={3} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Upload Evidence Files</Label>
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-4 text-center hover:border-primary/40 transition-colors cursor-pointer">
                      <div>
                        <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Click to upload satellite imagery, shapefiles, reports</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Upload Project Images</Label>
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border p-4 text-center hover:border-primary/40 transition-colors cursor-pointer">
                      <div>
                        <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Click to upload site photos and field images</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button onClick={() => setSubmitted(true)}>Submit for Verification</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
