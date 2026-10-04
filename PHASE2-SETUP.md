# SS PLAY Phase 2

Admin panel connected to the SS PLAY Supabase project.

## Files
- admin.html — admin login/dashboard
- admin.css — admin styling
- admin.js — Supabase admin content management
- config.js — browser-safe Supabase URL + publishable key
- supabase-schema.sql — database schema

## Important
The publishable key is safe for browser use when RLS/policies are configured. Never put a Supabase secret/service_role key in GitHub or browser code.

## Admin
The first admin user must exist in Supabase Authentication and have a row in `public.profiles` with `role = 'admin'`.
