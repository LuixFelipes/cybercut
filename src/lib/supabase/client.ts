import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rpetvvsmldomkmqkjrvz.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_1DOolPkKNBIEp8gX7Q-gSw_hdLW4XfG'
  )
}
