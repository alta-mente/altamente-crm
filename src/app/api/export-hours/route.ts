import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get('cid');
  const includeArchived = searchParams.get('archived') === '1';

  if (!companyId) {
    return new NextResponse('Missing company ID', { status: 400 });
  }

  const supabase = await createClient();

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Get company name
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('name')
    .eq('id', companyId)
    .single();

  if (companyError || !company) {
    return new NextResponse('Company not found', { status: 404 });
  }

  // Get hours
  let query = supabase
    .from('company_hours')
    .select('*')
    .eq('company_id', companyId)
    .order('date', { ascending: false })
    .order('id', { ascending: false });

  if (!includeArchived) {
    query = query.eq('billed', false);
  }

  const { data: hours, error: hoursError } = await query;

  if (hoursError) {
    return new NextResponse(hoursError.message, { status: 500 });
  }

  // Generate CSV
  const header = ['Data', 'Descrizione', 'Ore', 'Minuti', 'Stato', 'Batch'];
  const rows = hours.map((row) => {
    // Format date as DD/MM/YYYY
    const d = new Date(row.date);
    const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
    
    // Format hours (e.g. 1,5)
    const hoursFormatted = (row.minutes / 60).toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return [
      dateStr,
      `"${row.description.replace(/"/g, '""')}"`, // escape quotes in description
      hoursFormatted,
      row.minutes,
      row.billed ? 'Archiviato' : 'Aperto',
      row.batch_id || '',
    ].join(';');
  });

  const csvContent = [header.join(';'), ...rows].join('\r\n');
  
  // Add BOM for Excel
  const bom = '\uFEFF';
  const finalCsv = bom + csvContent;

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `ore_${company.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dateStr}.csv`;

  return new NextResponse(finalCsv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
