const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://twyvweywzwcapdaiywof.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3eXZ3ZXl3endjYXBkYWl5d29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MzU3OTIsImV4cCI6MjA3NzAxMTc5Mn0.n0wNRUzHdDa6ha5j97Jn8aO4FbQxFos_YEjTrP4prf8';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };



