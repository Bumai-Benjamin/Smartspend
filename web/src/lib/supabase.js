import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://clemqudjzbiyxtdagjav.supabase.co";
const supabaseAnonKey = "sb_publishable_eP49JcDhHV-eO8iqyLtT1A_L9FO_3ln";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
});
