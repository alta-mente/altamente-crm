'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendLowHoursAlertEmail, sendMonthlyConsuntiviEmail, sendMonthlyRetainerEmail } from './emails';

export async function toggleTimeTracking(projectId: string, enabled: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('projects')
    .update({ time_tracking_enabled: enabled })
    .eq('id', projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/projects');
  revalidatePath('/time-tracking');
}

export async function updateTimeTrackingSettings(
  projectId: string,
  settings: {
    prepaid_minutes?: number;
    hourly_rate?: number;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('projects')
    .update(settings)
    .eq('id', projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${projectId}`);
}

export async function addCompanyHours(data: {
  project_id: string;
  company_id: string; // for backward compatibility in table, but mostly we use project_id
  date: string;
  description: string;
  minutes: number;
}) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('company_hours').insert({
    project_id: data.project_id,
    company_id: data.company_id,
    date: data.date,
    description: data.description,
    minutes: data.minutes,
    billed: false,
    batch_id: '',
  });

  if (error) {
    throw new Error(error.message);
  }

  // Check if we need to send a low hours alert (Monte ore prepagato)
  try {
    const { data: proj } = await supabase
      .from('projects')
      .select('*, companies(contact_email, name)')
      .eq('id', data.project_id)
      .single();
      
    if (proj && proj.time_tracking_enabled && (proj.prepaid_minutes || 0) > 0 && proj.companies?.contact_email) {
      // Calculate remaining
      const { data: allHours } = await supabase.from('company_hours').select('minutes').eq('project_id', data.project_id);
      const totalLogged = (allHours || []).reduce((acc, h) => acc + (Number(h.minutes) || 0), 0);
      
      const remainingMinutes = proj.prepaid_minutes - totalLogged;
      const remainingHours = remainingMinutes / 60;
      const wasAboveThreshold = (remainingMinutes + data.minutes) / 60 > 2; // threshold is 2 hours

      // Only send exactly when it crosses the 2 hours threshold
      if (wasAboveThreshold && remainingHours <= 2) {
        const { data: settings } = await supabase.from('workspace_settings').select('logo_url').eq('id', 1).single();
        await sendLowHoursAlertEmail({
          to: proj.companies.contact_email,
          companyName: `${proj.companies.name} (Progetto: ${proj.title})`,
          remainingHours,
          logoUrl: settings?.logo_url
        });
      }
    }
  } catch (err) {
    console.error('Error checking monte ore threshold:', err);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${data.project_id}`);
}

export async function editCompanyHours(
  id: string,
  data: {
    date: string;
    description: string;
    minutes: number;
    project_id: string; // for revalidation
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
  revalidatePath(`/time-tracking/${data.project_id}`);
}

export async function deleteCompanyHours(id: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('company_hours').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${projectId}`);
}

export async function archiveCompanyHours(projectId: string) {
  const supabase = await createClient();
  
  // Fetch unbilled hours
  const { data: unbilledHours } = await supabase
    .from('company_hours')
    .select('id, minutes')
    .eq('project_id', projectId)
    .eq('billed', false);

  if (!unbilledHours || unbilledHours.length === 0) {
    return;
  }

  // Get project rate
  const { data: proj } = await supabase.from('projects').select('hourly_rate').eq('id', projectId).single();
  const rate = proj?.hourly_rate || 0;
  
  const totalMinutes = unbilledHours.reduce((acc, h) => acc + h.minutes, 0);
  const amount = (totalMinutes / 60) * rate;

  // Format batch_id as YYYYMMDD-HHMMSS
  const now = new Date();
  const batchId = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);

  // Create invoice
  const noteStr = `Fatturazione ore a consuntivo (Batch ${batchId})`;
  let invoiceId = null;

  if (amount > 0) {
    const { data: invData, error: invError } = await supabase.from('invoices').insert({
      project_id: projectId,
      amount,
      status: 'pending',
      notes: noteStr,
      issue_date: new Date().toISOString().split('T')[0]
    }).select('id').single();

    if (!invError && invData) {
      invoiceId = invData.id;
    }
  }

  const { error } = await supabase
    .from('company_hours')
    .update({ 
      billed: true, 
      batch_id: batchId,
      ...(invoiceId ? { invoice_id: invoiceId } : {})
    })
    .in('id', unbilledHours.map(h => h.id));

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${projectId}`);
}

export async function unarchiveCompanyHourRow(id: string, projectId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('company_hours')
    .update({ billed: false, batch_id: null, invoice_id: null })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${projectId}`);
}

export async function unarchiveBatch(batchId: string, projectId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('company_hours')
    .update({ billed: false, batch_id: null, invoice_id: null })
    .eq('batch_id', batchId)
    .eq('project_id', projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${projectId}`);
}

export async function generateReportToken(projectId: string) {
  const supabase = await createClient();
  
  // Generate a random token
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const { error } = await supabase
    .from('projects')
    .update({ report_token: token })
    .eq('id', projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/time-tracking');
  revalidatePath(`/time-tracking/${projectId}`);
  
  return token;
}

export async function notifyClientAboutReport(projectId: string, monthName: string) {
  const supabase = await createClient();
  
  // Get project info
  const { data: proj, error } = await supabase
    .from('projects')
    .select('*, companies(contact_email, name)')
    .eq('id', projectId)
    .single();
  
  if (error || !proj || !proj.companies) {
    return { success: false, error: 'Impossibile recuperare i dati del progetto' };
  }

  if (!proj.companies.contact_email) {
    return { success: false, error: 'Nessuna email di contatto impostata per l\'azienda' };
  }

  const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://altamente-crm.vercel.app'}/portal/${proj.company_id}`;

  const { data: settings } = await supabase.from('workspace_settings').select('logo_url').eq('id', 1).single();

  const { sendCompanyPortalEmail } = await import('@/app/actions/emails');
  
  const res = await sendCompanyPortalEmail({
    to: proj.companies.contact_email,
    companyName: proj.companies.name,
    portalUrl,
    logoUrl: settings?.logo_url
  });

  if (!res.success) {
    return { success: false, error: res.error || 'Errore durante l\'invio dell\'email' };
  }

  return { success: true };
}
