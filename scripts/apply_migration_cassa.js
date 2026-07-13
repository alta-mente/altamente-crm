import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    
    console.log('Running migration: cassa_competenza');
    
    // Check if column exists to avoid error on rerun
    const checkCompanyHours = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='company_hours' and column_name='invoice_id';
    `);
    
    if (checkCompanyHours.rows.length === 0) {
      await client.query(`
        ALTER TABLE public.company_hours 
        ADD COLUMN invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL;
      `);
      console.log('Added invoice_id to company_hours');
    } else {
      console.log('invoice_id already exists on company_hours');
    }

    const checkProjects = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='projects' and column_name='always_send_report';
    `);
    
    if (checkProjects.rows.length === 0) {
      await client.query(`
        ALTER TABLE public.projects 
        ADD COLUMN always_send_report boolean DEFAULT false;
      `);
      console.log('Added always_send_report to projects');
    } else {
      console.log('always_send_report already exists on projects');
    }

    console.log('Migration successful');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
