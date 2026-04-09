const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Profiles ERROR:", error);
  console.log("Profiles DATA:", JSON.stringify(data, null, 2));
}

checkProfiles();
