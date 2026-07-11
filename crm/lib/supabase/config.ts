// Supabase project connection. These are the PUBLIC values (project URL and
// anon key). The anon key is safe to ship in client code — every table is
// protected by Row Level Security, so it can only do what the RLS policies
// allow. Env vars override the defaults if you ever rotate the project.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://vxelnnoubozqmhqperrs.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4ZWxubm91Ym96cW1ocXBlcnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3OTU5OTQsImV4cCI6MjA5OTM3MTk5NH0.cLYobvf3nxQKe9ixNft59VJXQ3Ij-LIw6rLbl2K_IBY";
