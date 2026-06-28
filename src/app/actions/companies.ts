'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function mergeCompanies(sourceId: string, targetId: string) {
  const supabase = await createClient();

  if (sourceId === targetId) {
    return { success: false, error: 'Impossibile unire l\'azienda con se stessa.' };
  }

  // 1. Get both companies
  const { data: sourceCompany, error: sourceErr } = await supabase
    .from('companies')
    .select('*')
    .eq('id', sourceId)
    .single();

  const { data: targetCompany, error: targetErr } = await supabase
    .from('companies')
    .select('*')
    .eq('id', targetId)
    .single();

  if (sourceErr || targetErr || !sourceCompany || !targetCompany) {
    return { success: false, error: 'Errore durante il recupero delle aziende.' };
  }

  // 2. Merge properties into target if they are missing
  const updates: any = {};
  
  if (sourceCompany.time_tracking_enabled && !targetCompany.time_tracking_enabled) {
    updates.time_tracking_enabled = true;
  }
  
  if ((sourceCompany.prepaid_minutes || 0) > 0 && (targetCompany.prepaid_minutes || 0) === 0) {
    updates.prepaid_minutes = sourceCompany.prepaid_minutes;
  }

  if ((sourceCompany.hourly_rate || 0) > 0 && (targetCompany.hourly_rate || 0) === 0) {
    updates.hourly_rate = sourceCompany.hourly_rate;
  }

  if (sourceCompany.contact_email && !targetCompany.contact_email) {
    updates.contact_email = sourceCompany.contact_email;
  }

  if (sourceCompany.wp_id && !targetCompany.wp_id) {
    updates.wp_id = sourceCompany.wp_id;
  }

  if (sourceCompany.vat_number && !targetCompany.vat_number) {
    updates.vat_number = sourceCompany.vat_number;
  }

  if (sourceCompany.address && !targetCompany.address) {
    updates.address = sourceCompany.address;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateErr } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', targetId);
    
    if (updateErr) {
      return { success: false, error: `Errore aggiornamento dati azienda target: ${updateErr.message}` };
    }
  }

  // 3. Move relations from source to target
  const tablesToUpdate = ['company_hours', 'projects', 'services', 'deals', 'contacts'];
  
  for (const table of tablesToUpdate) {
    const { error: relErr } = await supabase
      .from(table)
      .update({ company_id: targetId })
      .eq('company_id', sourceId);
      
    if (relErr) {
      return { success: false, error: `Errore durante lo spostamento dei dati in ${table}.` };
    }
  }

  // 4. Delete source company
  const { error: delErr } = await supabase
    .from('companies')
    .delete()
    .eq('id', sourceId);

  if (delErr) {
    return { success: false, error: `Errore durante l'eliminazione dell'azienda di origine: ${delErr.message}` };
  }

  revalidatePath('/companies');
  revalidatePath('/time-tracking');
  revalidatePath('/board');
  revalidatePath('/projects');
  revalidatePath('/services');
  revalidatePath('/contacts');

  return { success: true };
}
