import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://crrgspcxeghjdbtbcwqw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycmdzcGN4ZWdoamRidGJjd3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTE3MDEsImV4cCI6MjA4MzQyNzcwMX0.SvK7_zqecuovD0qxV1E05NQ87xXa7y6Q-D5V2U1tsO4';

export const supabase = createClient(supabaseUrl, supabaseKey);
