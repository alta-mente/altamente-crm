'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleTimeTracking(companyId: string, enabled: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('companies')
    .update({ time_tracking_enabled: enabled })
    .eq('id', companyId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/companies');
  revalidatePath('/time-tracking');
}

export async function updateTimeTrackingSettings(
  companyId: string,
  settings: {
    contact_email?: string;
    prepaid_minutes?: number;
    hourly_rate?: number;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('companies')
    .update(settings)
    .eq('id', companyId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${companyId}`);
}

export async function addCompanyHours(data: {
  company_id: string;
  date: string;
  description: string;
  minutes: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('company_hours').insert({
    ...data,
    billed: false,
    batch_id: '',
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${data.company_id}`);
}

export async function editCompanyHours(
  id: string,
  data: {
    date: string;
    description: string;
    minutes: number;
    company_id: string; // for revalidation
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('company_hours')
    .update({
      date: data.date,
      description: data.description,
      minutes: data.minutes,
    })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${data.company_id}`);
}

export async function deleteCompanyHours(id: string, companyId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('company_hours').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${companyId}`);
}

export async function archiveCompanyHours(companyId: string) {
  const supabase = await createClient();
  
  // Format batch_id as YYYYMMDD-HHMMSS
  const now = new Date();
  const batchId = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);

  const { error } = await supabase
    .from('company_hours')
    .update({ billed: true, batch_id: batchId })
    .eq('company_id', companyId)
    .eq('billed', false);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${companyId}`);
}

export async function unarchiveCompanyHourRow(id: string, companyId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('company_hours')
    .update({ billed: false, batch_id: '' })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${companyId}`);
}

export async function generateReportToken(companyId: string) {
  const supabase = await createClient();
  
  // Generate a random token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const { error } = await supabase
    .from('companies')
    .update({ report_token: token })
    .eq('id', companyId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${companyId}`);
  
  return token;
}
