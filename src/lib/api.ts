const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export type VerificationResponse = {
  verified_at: string;
  claimed_area_ha: number;
  geometry_area_ha: number;
  area_difference_ha: number;
  area_consistency_percent: number;
  status: string;
  note: string;
};

export type NdviResponse = {
  source: string;
  start_date: string;
  end_date: string;
  bbox: number[];
  stats: {
    mean_ndvi: number;
    median_ndvi: number;
    vegetation_fraction: number;
    valid_pixels: number;
  };
  interpretation: string;
};

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || `Request failed (${response.status})`);
  return data as T;
}

export function verifyClaim(geometry: unknown, claimedAreaHa: number) {
  return post<VerificationResponse>('/api/verify-claim', {
    geometry,
    claimed_area_ha: claimedAreaHa,
  });
}

export function fetchSentinelNdvi(geometry: unknown, startDate: string, endDate: string) {
  return post<NdviResponse>('/api/satellite/ndvi', {
    geometry,
    start_date: startDate,
    end_date: endDate,
  });
}
