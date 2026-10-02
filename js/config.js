const SUPABASE_URL = "https://pqyohrcidtdthddsubmz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable__IvcPA3gx5wQa370mhbvvg_nIj1m1tz";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );