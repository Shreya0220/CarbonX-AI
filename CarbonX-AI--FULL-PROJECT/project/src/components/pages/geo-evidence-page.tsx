import { useState } from 'react';
import { Map, Layers, Eye, GitCompare, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfidenceBadge } from '@/components/shared/badges';
import { CoastalMap } from '@/components/shared/coastal-map';
import { PageHeader, PrototypeNotice } from '@/components/shared/page-header';
import { projectMarkers, getProject, projects } from '@/lib/mock-data';
import { fetchSentinelNdvi, verifyClaim, type NdviResponse, type VerificationResponse } from '@/lib/api';
import type { PageKey } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function GeoEvidencePage({
  projectId,
  onNavigate,
}: {
  projectId?: string;
  onNavigate: (page: PageKey, projectId?: string) => void;
}) {
  const [selectedId, setSelectedId] = useState(projectId || 'CX-2024-001');
  const project = getProject(selectedId) || projects[0];
  const [sliderPos, setSliderPos] = useState(50);
  const [geojsonText, setGeojsonText] = useState('');
  const [liveResult, setLiveResult] = useState<VerificationResponse | null>(null);
  const [ndviResult, setNdviResult] = useState<NdviResponse | null>(null);
  const [liveError, setLiveError] = useState('');
  const [liveLoading, setLiveLoading] = useState(false);

  async function runLiveAreaCheck() {
    setLiveError('');
    setLiveResult(null);
    try {
      const parsed = JSON.parse(geojsonText);
      const geometry = parsed.type === 'Feature' ? parsed.geometry : parsed.type === 'FeatureCollection' ? parsed.features?.[0]?.geometry : parsed;
      if (!geometry) throw new Error('Valid GeoJSON Polygon/Feature is required.');
      const result = await verifyClaim(geometry, project.claimedArea);
      setLiveResult(result);
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : 'Unable to verify this boundary.');
    }
  }

  async function runLiveNdvi() {
    setLiveError('');
    setNdviResult(null);
    try {
      const parsed = JSON.parse(geojsonText);
      const geometry = parsed.type === 'Feature' ? parsed.geometry : parsed.type === 'FeatureCollection' ? parsed.features?.[0]?.geometry : parsed;
      if (!geometry) throw new Error('Valid GeoJSON Polygon/Feature is required.');
      setLiveLoading(true);
      const result = await fetchSentinelNdvi(geometry, '2026-01-01', '2026-09-30');
      setNdviResult(result);
    } catch (error) {
      setLiveError(error instanceof Error ? error.message : 'Sentinel-2 request failed.');
    } finally {
      setLiveLoading(false);
    }
  }

  const marker = projectMarkers.find((m) => m.id === project.id);
  const markers = marker ? [marker, ...projectMarkers.filter((m) => m.id !== project.id)] : projectMarkers;

  const metrics = [
    { label: 'Observed Vegetation Change', value: 74, status: 'medium', detail: 'Moderate canopy density increase detected' },
    { label: 'Area Consistency', value: 61, status: 'warn', detail: 'Evidence area: 18.7 ha vs claimed 25 ha' },
    { label: 'Boundary Overlap', value: 87, status: 'fail', detail: '87% overlap with adjacent project' },
    { label: 'Evidence Confidence', value: 68, status: 'medium', detail: 'Satellite imagery partially consistent' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Geo Evidence"
        description="Geospatial intelligence for project boundary verification, satellite evidence comparison, and overlap detection."
        icon={Map}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live Evidence Check</CardTitle>
          <p className="text-xs text-muted-foreground">Submit a project GeoJSON boundary to calculate its real geodesic area. Sentinel-2 NDVI can be fetched after Copernicus credentials are configured on the backend.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={geojsonText}
            onChange={(e) => setGeojsonText(e.target.value)}
            placeholder="Paste a GeoJSON Feature/Polygon here..."
            className="min-h-24 w-full rounded-lg border bg-background p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={runLiveAreaCheck} disabled={!geojsonText.trim()}>
              <CheckCircle2 className="h-4 w-4" /> Calculate Real Area
            </Button>
            <Button variant="outline" onClick={runLiveNdvi} disabled={!geojsonText.trim() || liveLoading}>
              <Eye className="h-4 w-4" /> {liveLoading ? 'Fetching Sentinel-2...' : 'Fetch Sentinel-2 NDVI'}
            </Button>
          </div>
          {liveError && <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-xs text-destructive">{liveError}</div>}
          {liveResult && (
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border p-3"><p className="text-[10px] text-muted-foreground">Claimed</p><p className="text-lg font-bold">{liveResult.claimed_area_ha} ha</p></div>
              <div className="rounded-lg border p-3"><p className="text-[10px] text-muted-foreground">GeoJSON Area</p><p className="text-lg font-bold">{liveResult.geometry_area_ha} ha</p></div>
              <div className="rounded-lg border p-3"><p className="text-[10px] text-muted-foreground">Difference</p><p className="text-lg font-bold">{liveResult.area_difference_ha} ha</p></div>
              <div className="rounded-lg border p-3"><p className="text-[10px] text-muted-foreground">Consistency</p><p className="text-lg font-bold">{liveResult.area_consistency_percent}%</p></div>
            </div>
          )}
          {ndviResult && (
            <div className="rounded-lg border border-info/25 bg-info/5 p-3">
              <div className="flex items-center justify-between"><p className="text-sm font-semibold">{ndviResult.source}</p><Badge variant="outline">Live data</Badge></div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div><p className="text-[10px] text-muted-foreground">Mean NDVI</p><p className="font-bold">{ndviResult.stats.mean_ndvi}</p></div>
                <div><p className="text-[10px] text-muted-foreground">Median NDVI</p><p className="font-bold">{ndviResult.stats.median_ndvi}</p></div>
                <div><p className="text-[10px] text-muted-foreground">Vegetation fraction</p><p className="font-bold">{Math.round(ndviResult.stats.vegetation_fraction * 100)}%</p></div>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">{ndviResult.interpretation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map + layers */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Project Boundary & Satellite Evidence Zone</CardTitle>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" className="text-xs"><Layers className="h-3.5 w-3.5" /> Layers</Button>
                <Button variant="ghost" size="sm" className="text-xs"><Eye className="h-3.5 w-3.5" /> Overlaps</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 px-4 pb-4">
            <CoastalMap
              markers={markers}
              selectedId={project.id}
              className="h-[360px]"
              showOverlaps
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-info/5 text-info border-info/25">
                <span className="h-2 w-2 rounded-sm bg-info/40 mr-1.5" /> Project Boundary
              </Badge>
              <Badge variant="outline" className="bg-accent/5 text-accent border-accent/25">
                <span className="h-2 w-2 rounded-sm bg-accent/40 mr-1.5" /> Satellite Evidence Zone
              </Badge>
              <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/25">
                <span className="h-2 w-2 rounded-sm bg-destructive/40 mr-1.5" /> Overlapping Projects
              </Badge>
              <Badge variant="outline" className="bg-warning/5 text-warning border-warning/25">
                <span className="h-2 w-2 rounded-sm bg-warning/40 mr-1.5" /> Suspicious Zones
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Evidence metrics */}
        <Card>
          <CardHeader><CardTitle className="text-base">Evidence Metrics</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium">{m.label}</p>
                  <span className={cn('text-sm font-bold tabular-nums', m.status === 'fail' ? 'text-destructive' : m.status === 'warn' ? 'text-warning' : 'text-success')}>
                    {m.value}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-1.5">
                  <div
                    className={cn('h-full rounded-full transition-all duration-1000', m.status === 'fail' ? 'bg-destructive' : m.status === 'warn' ? 'bg-warning' : 'bg-success')}
                    style={{ width: `${m.value}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">{m.detail}</p>
              </div>
            ))}
            <div className="rounded-lg border border-info/25 bg-info/5 p-3 flex gap-2">
              <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground">
                Prototype uses sample/simulated imagery evidence for demonstration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Before vs After comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base">Before vs After — Satellite Imagery Comparison</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Drag the slider to compare 2024 baseline vs 2026 current imagery</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden border select-none">
            {/* After image (2026) */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, hsl(142 45% 35%) 0%, hsl(142 40% 28%) 30%, hsl(168 50% 30%) 60%, hsl(198 55% 38%) 100%)',
            }}>
              <div className="absolute inset-0 bg-dots opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white/90 text-lg font-bold">2026 — Current</p>
                  <p className="text-white/60 text-xs mt-1">Restored mangrove canopy visible</p>
                </div>
              </div>
              {/* Vegetation patches */}
              <div className="absolute top-[20%] left-[15%] h-16 w-24 rounded-full bg-success/30 blur-md" />
              <div className="absolute top-[45%] left-[40%] h-20 w-32 rounded-full bg-success/40 blur-md" />
              <div className="absolute top-[60%] left-[20%] h-14 w-20 rounded-full bg-success/25 blur-sm" />
              <div className="absolute top-[30%] right-[25%] h-18 w-28 rounded-full bg-success/35 blur-md" />
            </div>

            {/* Before image (2024) - clipped */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(135deg, hsl(35 40% 55%) 0%, hsl(35 35% 48%) 30%, hsl(30 30% 42%) 60%, hsl(200 30% 45%) 100%)',
              }}>
                <div className="absolute inset-0 bg-dots opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white/90 text-lg font-bold">2024 — Baseline</p>
                    <p className="text-white/60 text-xs mt-1">Degraded coastline, sparse vegetation</p>
                  </div>
                </div>
                {/* Sparse patches */}
                <div className="absolute top-[30%] left-[20%] h-8 w-12 rounded-full bg-warning/20 blur-sm" />
                <div className="absolute top-[55%] left-[45%] h-10 w-16 rounded-full bg-warning/15 blur-sm" />
              </div>
            </div>

            {/* Slider handle */}
            <div className="absolute inset-y-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPos}%` }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white shadow-lg flex items-center justify-center">
                <GitCompare className="h-4 w-4 text-foreground rotate-90" />
              </div>
            </div>

            {/* Range input */}
            <input
              type="range"
              min={0}
              max={100}
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
            />
          </div>

          {/* Comparison stats */}
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-[10px] text-muted-foreground">2024 Vegetation Cover</p>
              <p className="text-lg font-bold tabular-nums">23%</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-[10px] text-muted-foreground">2026 Vegetation Cover</p>
              <p className="text-lg font-bold tabular-nums text-success">61%</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-[10px] text-muted-foreground">Observed Change</p>
              <p className="text-lg font-bold tabular-nums text-success">+38%</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-[10px] text-muted-foreground">Evidence Confidence</p>
              <p className="text-lg font-bold tabular-nums"><ConfidenceBadge value={68} /></p>
            </div>
          </div>

          {/* Overlap detection */}
          {project.anomalies.some(a => a.type === 'Spatial Overlap') && (
            <div className="mt-4 rounded-lg border border-destructive/25 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Potential Spatial Overlap Detected</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Project boundary overlaps with <span className="font-mono">CX-2024-007</span> (Mahanadi Delta Project) by approximately 87%. This may indicate a duplicate claim.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => onNavigate('risk')}>
                    View Overlap Analysis
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
