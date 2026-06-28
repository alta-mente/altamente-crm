'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendLowHoursAlertEmail, sendReportArchivedEmail } from './emails';

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

  // Check if we need to send a low hours alert (Monte ore prepagato)
  try {
    const { data: comp } = await supabase.from('companies').select('*').eq('id', data.company_id).single();
    if (comp && comp.time_tracking_enabled && (comp.prepaid_minutes || 0) > 0 && comp.contact_email) {
      // Calculate remaining
      const { data: allHours } = await supabase.from('company_hours').select('minutes').eq('company_id', data.company_id);
      const totalLogged = (allHours || []).reduce((acc, h) => acc + (Number(h.minutes) || 0), 0);
      
      const remainingMinutes = comp.prepaid_minutes - totalLogged;
      const remainingHours = remainingMinutes / 60;
      const wasAboveThreshold = (remainingMinutes + data.minutes) / 60 > 2; // threshold is 2 hours

      // Only send exactly when it crosses the 2 hours threshold
      if (wasAboveThreshold && remainingHours <= 2) {
        await sendLowHoursAlertEmail({
          to: comp.contact_email,
          companyName: comp.name,
          remainingHours
        });
      }
    }
  } catch (err) {
    console.error('Error checking monte ore threshold:', err);
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

export async function notifyClientAboutReport(companyId: string, monthName: string) {
  const supabase = await createClient();
  
  // Get company info
  const { data: comp, error } = await supabase.from('companies').select('*').eq('id', companyId).single();
  
  if (error || !comp) {
    return { success: false, error: 'Impossibile recuperare i dati dell\'azienda' };
  }

  if (!comp.contact_email) {
    return { success: false, error: 'Nessuna email di contatto impostata per questa azienda' };
  }

  // Ensure report token exists
  let token = comp.report_token;
  if (!token) {
    token = await generateReportToken(companyId);
  }

  const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://altamente-crm.vercel.app'}/report/${token}`;

  const res = await sendReportArchivedEmail({
    to: comp.contact_email,
    companyName: comp.name,
    reportUrl,
    monthName
  });

  if (!res.success) {
    return { success: false, error: res.error || 'Errore durante l\'invio dell\'email' };
  }

  return { success: true };
}
