import type { MealPlan } from '@/types/domain';
import { supabase } from '@/lib/supabase';

function getEnvVar(key: string): string {
  try {
    return import.meta.env[key] || '';
  } catch {
    return '';
  }
}

export function getWorkersApiBaseUrl(): string {
  return (
    getEnvVar('VITE_WORKERS_API_URL') ||
    getEnvVar('VITE_WORKER_API_URL')
  ).replace(/\/$/, '');
}

export function isWorkersApiConfigured(): boolean {
  return Boolean(getWorkersApiBaseUrl());
}

export async function generateMealPlanViaWorkers(): Promise<MealPlan> {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  const baseUrl = getWorkersApiBaseUrl();
  if (!baseUrl) {
    throw new Error('Missing VITE_WORKERS_API_URL');
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${baseUrl}/meal-plans/generate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ regenerate: true }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Worker error (${res.status}): ${text}`);
  }

  return (await res.json()) as MealPlan;
}
