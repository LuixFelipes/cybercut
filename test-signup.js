const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  const email = `test_${Date.now()}@example.com`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'password123',
    options: {
      data: { nome: 'Test User' },
    },
  });

  console.log("Response ERROR:", error);
  console.log("Response DATA:", JSON.stringify(data, null, 2));
}

testSignup();
