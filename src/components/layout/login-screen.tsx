import { useState } from 'react';
import { Waves, Mail, Lock, ArrowRight, ShieldCheck, Leaf, MapPin, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Role } from '@/lib/types';

export function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  const [email, setEmail] = useState('verifier@carbonx.ai');
  const [password, setPassword] = useState('demo1234');
  const [selectedRole, setSelectedRole] = useState<Role>('Verifier');

  const roles: { key: Role; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'Project Owner', desc: 'Submit & track projects', icon: Leaf },
    { key: 'Verifier', desc: 'Review & approve claims', icon: ShieldCheck },
    { key: 'Auditor', desc: 'Audit verification records', icon: Brain },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[hsl(205_38%_12%)] via-[hsl(200_35%_16%)] to-[hsl(190_40%_18%)]">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
            <Waves className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold text-white tracking-tight">CARBONX AI</p>
            <p className="text-xs text-white/60">Blue Carbon Verification Intelligence</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              AI-Powered Decision Support
            </span>
            <h1 className="text-4xl font-bold text-white leading-tight text-balance">
              Measure. Verify.<br />Detect. Trust.
            </h1>
            <p className="text-sm text-white/60 max-w-md leading-relaxed">
              AI-assisted verification platform for blue-carbon restoration claims — combining geospatial intelligence, anomaly detection, and tamper-evident audit trails.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { icon: MapPin, label: 'Geospatial Analysis' },
              { icon: Brain, label: 'AI Verification' },
              { icon: ShieldCheck, label: 'Audit Trail' },
            ].map((f) => (
              <div key={f.label} className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                <f.icon className="h-5 w-5 text-primary mb-1.5" />
                <p className="text-[11px] font-medium text-white/70 leading-tight">{f.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          CarbonX AI — Prototype for Academic Demonstration
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold tracking-tight">CARBONX AI</p>
              <p className="text-[10px] text-muted-foreground">Blue Carbon Verification Intelligence</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to access the verification dashboard</p>
          </div>

          {/* Role selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo Role</Label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => {
                const active = selectedRole === r.key;
                const Icon = r.icon;
                return (
                  <button
                    key={r.key}
                    onClick={() => setSelectedRole(r.key)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all',
                      active
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border hover:border-primary/30 hover:bg-muted/50'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', active ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('text-[11px] font-semibold leading-tight', active ? 'text-primary' : 'text-foreground')}>{r.key}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight">{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  placeholder="you@organization.org"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button className="text-xs text-primary hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full h-11 text-sm font-semibold" onClick={() => onLogin(selectedRole)}>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full h-11 text-sm font-semibold" onClick={() => onLogin(selectedRole)}>
              Quick Demo Login
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Prototype for academic demonstration · Sample data only
          </p>
        </div>
      </div>
    </div>
  );
}
