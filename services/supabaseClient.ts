import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hhhqnaavrvdxydgifxyu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoaHFuYWF2cnZkeHlkZ2lmeHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzExNDIsImV4cCI6MjA4NjUwNzE0Mn0.uiQC9gyQU4H9LbgDEfdCB2-aQ3OjyLK1DQobIfiQrv4';

export const supabase = createClient(supabaseUrl, supabaseKey);