import { useState } from 'react';
import { Search, Bell, ChevronDown, Menu, Waves, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import type { Role } from '@/lib/types';

export function Header({
  role,
  onMenuClick,
  onLogout,
}: {
  role: Role;
  onMenuClick: () => void;
  onLogout: () => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifications = [
    { title: 'Area mismatch detected', desc: 'GreenCoast Mangrove — 25 ha claimed, 18.7 ha evidence', time: '2h ago', severity: 'high' },
    { title: 'Duplicate spatial claim', desc: 'CX-2024-001 overlaps CX-2024-007 by 87%', time: '3h ago', severity: 'high' },
    { title: 'Evidence inconsistency', desc: 'BlueForest Initiative — satellite imagery mismatch', time: '5h ago', severity: 'critical' },
    { title: 'Missing evidence', desc: 'Kutch Salt Marsh Pilot — field survey pending', time: '8h ago', severity: 'medium' },
  ];

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur-md sm:px-6">
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted">
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo on mobile */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Waves className="h-4 w-4" />
        </div>
        <span className="font-bold text-sm">CarbonX AI</span>
      </div>

      {/* Tagline on desktop */}
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Blue Carbon Verification Intelligence</span>
      </div>

      {/* Prototype badge */}
      <span className="hidden md:inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning">
        <BadgeCheck className="h-3 w-3" />
        Prototype
      </span>

      {/* Search */}
      <div className="ml-auto hidden sm:flex items-center w-48 md:w-64">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="h-9 pl-9 text-sm bg-muted/50 border-muted" />
        </div>
      </div>

      {/* Notifications */}
      <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
        <DropdownMenuTrigger asChild>
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0">
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2.5">
            <span>Notifications</span>
            <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold text-destructive">{notifications.length} new</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.map((n, i) => (
            <div key={i} className="flex gap-2.5 px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-0">
              <span
                className={
                  n.severity === 'critical' ? 'mt-1 h-2 w-2 rounded-full bg-destructive shrink-0' :
                  n.severity === 'high' ? 'mt-1 h-2 w-2 rounded-full bg-warning shrink-0' :
                  'mt-1 h-2 w-2 rounded-full bg-info shrink-0'
                }
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{n.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{n.desc}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-xs text-primary cursor-pointer">View all alerts</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg hover:bg-muted p-1 pr-2 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold">
              {role === 'Verifier' ? 'VM' : role === 'Auditor' ? 'AU' : 'PO'}
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-xs font-semibold">{role === 'Verifier' ? 'Dr. Anjali Mehta' : role === 'Auditor' ? 'Audit Panel' : 'Project Owner'}</span>
              <span className="text-[10px] text-muted-foreground">{role}</span>
            </div>
            <ChevronDown className="hidden md:block h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs cursor-pointer">Profile</DropdownMenuItem>
          <DropdownMenuItem className="text-xs cursor-pointer">Settings</DropdownMenuItem>
          <DropdownMenuItem className="text-xs cursor-pointer">Help & Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs cursor-pointer text-destructive" onClick={onLogout}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
