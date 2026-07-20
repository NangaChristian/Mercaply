# Security and Bug Audit Report

## 1. Critical Authentication Bug (Fixed)
**Issue:** The `ProtectedRoute.tsx` component was checking for a `firebaseUser` variable instead of `supabaseUser`. Since the app migrated from Firebase to Supabase, `firebaseUser` was always undefined, which would cause all authenticated routes to bounce users back to the login page.
**Resolution:** Updated `ProtectedRoute.tsx` to correctly reference `supabaseUser`.

## 2. Broken Realtime Notifications (Fixed)
**Issue:** The `OrderNotifications.tsx` component still contained legacy Firebase code (`query`, `onSnapshot`, `collection`) without importing them. Furthermore, it relied on a mocked implementation of `onSnapshot` that did absolutely nothing. At runtime, it threw `ReferenceError`.
**Resolution:** Completely rewrote `OrderNotifications.tsx` to use Supabase Realtime channels (`supabase.channel('orders_channel').on(...)`) listening for `INSERT` and `UPDATE` events on the `orders` table.

## 3. Potential Privilege Escalation (Security Warning)
**Issue:** In `AuthProvider.tsx`, the client directly issues an update to change the user's role: 
`await supabase.from('profiles').update({ role: 'seller' }).eq('id', session.user.id);`
**Risk:** If Row Level Security (RLS) on the `profiles` table is not strictly configured to prevent users from updating the `role` column, any authenticated user can intercept the request or use the Supabase JS client in their browser console to run `.update({ role: 'admin' })`, granting themselves administrator privileges.
**Recommendation:** 
- In Supabase, modify the RLS `UPDATE` policy on the `profiles` table so that users cannot modify the `role` column. 
- Alternatively, move role assignment logic to a secure database function (RPC) or a server-side endpoint that uses a Service Role key to bypass RLS securely.

## 4. Missing Database Validation
**Issue:** The `stores` and `profiles` tables are currently accepting client-provided data during the initial signup sync in `AuthProvider.tsx`. 
**Risk:** A malicious user can submit arbitrary `store_name` or `store_description` metadata, potentially bypassing client-side validation rules (like length limits or forbidden words).
**Recommendation:** Ensure Supabase database constraints (like `CHECK` constraints) are in place to validate string lengths and prevent malicious inputs.

