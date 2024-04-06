import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://slqtkecsqggjjtdathmo.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNscXRrZWNzcWdnamp0ZGF0aG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTExMjkzOTEsImV4cCI6MjAyNjcwNTM5MX0._3xkjSurb6wIXYxREBRMEUQHvniiMUgtWaJHwXuj2-8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
