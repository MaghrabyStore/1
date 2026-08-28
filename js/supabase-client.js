// Supabase client. لا تستخدم Service Role Key في المتصفح.
const SUPABASE_READY =
  SITE_CONFIG.supabaseUrl &&
  SITE_CONFIG.supabaseAnonKey &&
  !SITE_CONFIG.supabaseUrl.includes("ضع_") &&
  !SITE_CONFIG.supabaseAnonKey.includes("ضع_");

const supabaseClient = SUPABASE_READY
  ? window.supabase.createClient(SITE_CONFIG.supabaseUrl, SITE_CONFIG.supabaseAnonKey)
  : null;
