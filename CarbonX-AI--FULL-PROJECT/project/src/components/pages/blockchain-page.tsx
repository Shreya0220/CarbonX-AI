import { useState } from 'react';
import { Link2, ShieldCheck, Search, CheckCircle2, Clock, AlertTriangle, FileText, Hash, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/badges';
import { PageHeader, PrototypeNotice } from '@/components/shared/page-header';
import { auditRecords } from '@/lib/mock-data';
import type { PageKey } from '@/lib/types';
import { cn } from '@/lib/utils';

export function BlockchainPage({ onNavigate }: { onNavigate: (page: PageKey, projectId?: string) => void }) {
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<typeof auditRecords[0] | null>(null);

  const filtered = auditRecords.filter(
    (r) => search === '' || r.projectName.toLowerCase().includes(search.toLowerCase()) || r.hash.toLowerCase().includes(search.toLowerCase()) || r.projectId.toLowerCase().includes(search.toLowerCase())
  );

  const verifyRecord = (record: typeof auditRecords[0]) => {
    setSelectedRecord(record);
    setVerifying(true);
    setVerified(false);
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);
    }, 1800);
  };

  const stats = [
    { label: 'Total Records', value: auditRecords.length, icon: FileText, color: 'text-info' },
    { label: 'Verified', value: auditRecords.filter(r => r.status === 'verified').length, icon: CheckCircle2, color: 'text-success' },
    { label: 'Pending', value: auditRecords.filter(r => r.status === 'pending').length, icon: Clock, color: 'text-warning' },
    { label: 'Flagged', value: auditRecords.filter(r => r.status === 'flagged').length, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blockchain Audit Explorer"
        description="Tamper-evident audit trail for verified blue-carbon project records. Each verification creates an immutable proof of integrity."
        icon={Link2}
      />
      <PrototypeNotice />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.label} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg bg-muted', s.color)}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by project, hash, or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Records table */}
      <Card>
        <CardHeader><CardTitle className="text-base">Audit Records</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Project ID</th>
                  <th className="px-4 py-3 font-semibold">Project Name</th>
                  <th className="px-4 py-3 font-semibold">Verification ID</th>
                  <th className="px-4 py-3 font-semibold">Hash</th>
                  <th className="px-4 py-3 font-semibold">Timestamp</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Record Type</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.projectId}</td>
                    <td className="px-4 py-3 text-xs font-medium">{r.projectName}</td>
                    <td className="px-4 py-3 text-xs font-mono">{r.verificationId}</td>
                    <td className="px-4 py-3 text-xs font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        {r.hash.slice(0, 10)}...{r.hash.slice(-4)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.timestamp}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn(
                        'text-xs',
                        r.status === 'verified' ? 'border-success/25 text-success' :
                        r.status === 'pending' ? 'border-warning/25 text-warning' :
                        'border-destructive/25 text-destructive'
                      )}>{r.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs">{r.recordType}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" onClick={() => verifyRecord(r)}>Verify</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Verify modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setSelectedRecord(null); setVerified(false); }}>
          <Card className="max-w-lg w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Verify Record Integrity</CardTitle>
                </div>
                <button onClick={() => { setSelectedRecord(null); setVerified(false); }} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Project</span><span className="font-medium">{selectedRecord.projectName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Verification ID</span><span className="font-mono text-xs">{selectedRecord.verificationId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Record Type</span><span className="font-medium">{selectedRecord.recordType}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Timestamp</span><span className="text-xs">{selectedRecord.timestamp}</span></div>
                <div className="rounded-lg border p-3 space-y-1.5">
                  <p className="text-xs text-muted-foreground">Verification Hash</p>
                  <p className="text-sm font-mono break-all">{selectedRecord.hash}</p>
                </div>
                <div className="rounded-lg border p-3 space-y-1.5">
                  <p className="text-xs text-muted-foreground">Transaction Reference</p>
                  <p className="text-sm font-mono break-all">{selectedRecord.txRef}</p>
                </div>
              </div>

              {verifying && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-xs text-muted-foreground">Verifying integrity proof...</p>
                  </div>
                </div>
              )}

              {verified && (
                <div className="flex items-center gap-3 rounded-lg border border-success/25 bg-success/5 p-3 animate-fade-up">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-success">Integrity Verified</p>
                    <p className="text-xs text-muted-foreground">Integrity proof verified for this prototype record. Hash matches the stored value — no tampering detected.</p>
                  </div>
                </div>
              )}

              {!verifying && !verified && (
                <Button className="w-full" onClick={() => verifyRecord(selectedRecord)}>
                  <ShieldCheck className="h-4 w-4" /> Verify Record Integrity
                </Button>
              )}

              <div className="rounded-lg border border-info/25 bg-info/5 p-3 flex gap-2">
                <AlertTriangle className="h-4 w-4 text-info shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  This is a simulated blockchain audit trail for prototype demonstration. No production blockchain deployment.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
