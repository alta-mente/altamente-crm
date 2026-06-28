const fs = require('fs');
const path = require('path');

function generateSql() {
  const jsonPath = path.join(__dirname, '..', 'export.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('File export.json non trovato nella cartella principale del progetto.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const companies = data.companies || [];
  const hours = data.hours || [];

  let sql = `-- MIGRATION SCRIPT GENERATO AUTOMATICAMENTE\n`;
  sql += `DO $$\n`;
  sql += `DECLARE\n`;
  sql += `    cid uuid;\n`;
  sql += `BEGIN\n\n`;

  // Group hours by company_wp_id for faster generation
  const hoursByWpId = {};
  for (const h of hours) {
    if (!hoursByWpId[h.company_wp_id]) hoursByWpId[h.company_wp_id] = [];
    hoursByWpId[h.company_wp_id].push(h);
  }

  for (const comp of companies) {
    const safeName = comp.name.replace(/'/g, "''");
    const safeEmail = comp.contact_email ? comp.contact_email.replace(/'/g, "''") : '';
    
    sql += `    -- Azienda: ${safeName} (WP ID: ${comp.wp_id})\n`;
    sql += `    SELECT id INTO cid FROM public.companies WHERE name = '${safeName}' LIMIT 1;\n`;
    sql += `    IF NOT FOUND THEN\n`;
    sql += `        INSERT INTO public.companies (name, time_tracking_enabled, contact_email, prepaid_minutes, hourly_rate, wp_id)\n`;
    sql += `        VALUES ('${safeName}', ${comp.time_tracking_enabled}, '${safeEmail}', ${comp.prepaid_minutes}, ${comp.hourly_rate}, ${comp.wp_id})\n`;
    sql += `        RETURNING id INTO cid;\n`;
    sql += `    ELSE\n`;
    sql += `        UPDATE public.companies \n`;
    sql += `        SET time_tracking_enabled = ${comp.time_tracking_enabled}, contact_email = '${safeEmail}', prepaid_minutes = ${comp.prepaid_minutes}, hourly_rate = ${comp.hourly_rate}, wp_id = ${comp.wp_id} \n`;
    sql += `        WHERE id = cid;\n`;
    sql += `    END IF;\n\n`;

    const compHours = hoursByWpId[comp.wp_id] || [];
    if (compHours.length > 0) {
      sql += `    INSERT INTO public.company_hours (company_id, date, description, minutes, billed, batch_id) VALUES\n`;
      
      const values = compHours.map(h => {
        const safeDesc = h.description.replace(/'/g, "''");
        // format date properly (remove time if present)
        const dateOnly = h.date.split(' ')[0];
        return `    (cid, '${dateOnly}', '${safeDesc}', ${h.minutes}, ${h.billed}, '${h.batch_id || ''}')`;
      });
      
      sql += values.join(',\n') + `;\n\n`;
    }
  }

  sql += `END $$;\n`;

  const outPath = path.join(__dirname, '..', 'import_data.sql');
  fs.writeFileSync(outPath, sql);
  console.log(`\nFatto! Il file SQL per l'importazione è stato generato in: ${outPath}`);
  console.log('Puoi ora copiare il contenuto di import_data.sql e incollarlo nel SQL Editor di Supabase.');
}

generateSql();
