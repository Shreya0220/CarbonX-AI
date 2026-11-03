import { useState } from 'react';
import { Settings, User, Bell, Shield, Info, Sliders, UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader, PrototypeNotice } from '@/components/shared/page-header';
import type { Role } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SettingsPage({ role }: { role: Role }) {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifAnomalies, setNotifAnomalies] = useState(true);
  const [notifReports, setNotifReports] = useState(false);
  const [threshold, setThreshold] = useState(75);
  const [demoMode, setDemoMode] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your profile, notification preferences, and verification thresholds." icon={Settings} />
      <PrototypeNotice />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg font-bold">
                {role === 'Verifier' ? 'VM' : role === 'Auditor' ? 'AU' : 'PO'}
              </div>
              <div>
                <p className="text-sm font-semibold">{role === 'Verifier' ? 'Dr. Anjali Mehta' : role === 'Auditor' ? 'Audit Panel' : 'Project Owner'}</p>
                <p className="text-xs text-muted-foreground">{role}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input defaultValue={role === 'Verifier' ? 'Dr. Anjali Mehta' : role === 'Auditor' ? 'Audit Panel' : 'Project Owner'} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" defaultValue={`${role.toLowerCase().replace(' ', '')}@carbonx.ai`} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Organization</Label>
              <Input defaultValue="CarbonX AI Verification Lab" />
            </div>
            <Button size="sm">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Role */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-accent" />
              <CardTitle className="text-base">Role & Permissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">Current Role</span>
                <Badge className="bg-primary/15 text-primary border-primary/25">{role}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {role === 'Verifier' ? 'Can review, approve, or reject project verification claims.' :
                 role === 'Auditor' ? 'Can view audit trails and verification records.' :
                 'Can submit and track restoration projects.'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold">Permissions</p>
              {[
                { perm: 'View projects', granted: true },
                { perm: 'Run AI verification', granted: true },
                { perm: 'Approve / reject claims', granted: role === 'Verifier' },
                { perm: 'View blockchain audit', granted: true },
                { perm: 'Manage verification thresholds', granted: role === 'Verifier' || role === 'Auditor' },
                { perm: 'Register new projects', granted: role === 'Project Owner' },
              ].map((p) => (
                <div key={p.perm} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{p.perm}</span>
                  <Switch checked={p.granted} disabled />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-info" />
              <CardTitle className="text-base">Notification Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Email notifications', desc: 'Receive verification updates via email', value: notifEmail, set: setNotifEmail },
              { label: 'Push notifications', desc: 'In-app alerts for new activity', value: notifPush, set: setNotifPush },
              { label: 'Anomaly alerts', desc: 'Get notified when AI detects anomalies', value: notifAnomalies, set: setNotifAnomalies },
              { label: 'Weekly report digest', desc: 'Summary of verification activity', value: notifReports, set: setNotifReports },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch checked={n.value} onCheckedChange={n.set} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Verification thresholds */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-warning" />
              <CardTitle className="text-base">Verification Threshold Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs">Auto-approve Confidence Threshold</Label>
                <span className="text-sm font-bold tabular-nums text-primary">{threshold}%</span>
              </div>
              <Slider value={[threshold]} min={50} max={95} step={1} onValueChange={(v) => setThreshold(v[0])} />
              <p className="text-[10px] text-muted-foreground">Projects above this confidence may be auto-approved. Below requires manual review.</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={cn('rounded-lg border p-2', threshold <= 60 ? 'border-destructive/30 bg-destructive/5' : '')}>
                <p className="text-xs font-semibold text-destructive">Low</p>
                <p className="text-[10px] text-muted-foreground">&lt; 60%</p>
              </div>
              <div className={cn('rounded-lg border p-2', threshold > 60 && threshold <= 80 ? 'border-warning/30 bg-warning/5' : '')}>
                <p className="text-xs font-semibold text-warning">Medium</p>
                <p className="text-[10px] text-muted-foreground">60-80%</p>
              </div>
              <div className={cn('rounded-lg border p-2', threshold > 80 ? 'border-success/30 bg-success/5' : '')}>
                <p className="text-xs font-semibold text-success">High</p>
                <p className="text-[10px] text-muted-foreground">&gt; 80%</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Default Review Level</Label>
              <Select defaultValue="standard">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-approve eligible</SelectItem>
                  <SelectItem value="standard">Standard review</SelectItem>
                  <SelectItem value="senior">Senior review</SelectItem>
                  <SelectItem value="escalated">Escalated audit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Demo mode + system info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Demo Mode & System Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Demo Mode</p>
                <p className="text-xs text-muted-foreground">Use sample data and simulated AI results for demonstration</p>
              </div>
              <Switch checked={demoMode} onCheckedChange={setDemoMode} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Version</p>
                <p className="text-sm font-semibold">CarbonX AI v1.0.0</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Environment</p>
                <p className="text-sm font-semibold">Prototype</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Data Source</p>
                <p className="text-sm font-semibold">Sample / Mock</p>
              </div>
            </div>
            <div className="rounded-lg border border-info/25 bg-info/5 p-3 flex gap-2">
              <Shield className="h-4 w-4 text-info shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                This is a prototype for academic demonstration. All data is simulated. Not a production system. AI results are decision-support only, not legally binding certification.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
