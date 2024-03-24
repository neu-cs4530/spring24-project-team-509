import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://slqtkecsqggjjtdathmo.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNscXRrZWNzcWdnamp0ZGF0aG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTExMjkzOTEsImV4cCI6MjAyNjcwNTM5MX0._3xkjSurb6wIXYxREBRMEUQHvniiMUgtWaJHwXuj2-8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const insertRow = async (table: string, data: any) => {
  const { data: newRow, error } = await supabase.from(table).insert(data);
  if (error) {
    console.error(error.message);
  }
  return newRow;
};

export const updateRow = async (table: string, id: string, data: any) => {
  const { data: updatedRow, error } = await supabase.from(table).update(data).eq('id', id);
  if (error) {
    console.error(error.message);
  }
  return updatedRow;
};

export const deleteRow = async (table: string, id: string) => {
  const { data: deletedRow, error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    console.error(error.message);
  }
  return deletedRow;
};
