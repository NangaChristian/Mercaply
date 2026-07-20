# Authentication Flow & Role Assignment Audit

## Overview
This document audits the user registration paths and role assignment logic in Mercaply, verifying the correct separation of permissions between Buyer and Seller accounts.

## Registration Paths

1. **Buyer Registration (`/auth/register?role=buyer`)**
   - **Form Fields:** Email, Password, First Name, Last Name
   - **Event Trigger:** `supabase.auth.signUp()`
   - **Role Assignment:**
     - Passed in `user_metadata.role` as `'buyer'`.
     - Supabase database trigger (`handle_new_user`) intercepts the new auth.users record.
     - Database trigger automatically inserts a new row in the `public.profiles` table with `role = 'buyer'`.
   - **Post-Registration State:** The user profile accurately reflects a Buyer role immediately.

2. **Seller Registration (`/auth/register?role=seller`)**
   - **Form Fields:** Email, Password, First Name, Last Name, Store Name, Main Category, CNI/RC Number, Short Description
   - **Event Trigger:** `supabase.auth.signUp()`
   - **Role Assignment:**
     - Passed in `user_metadata.role` as `'seller'` along with `store_name` and `store_description`.
     - **Conflict Identified:** Supabase's `handle_new_user` trigger enforces a default fallback by assigning `role = 'buyer'` to the `public.profiles` row upon creation, ignoring the `user_metadata` requested role.
     - **Resolution Mechanism (Authentication Handler):** In `AuthProvider.tsx`, upon the first successful login session, the application intercepts the mismatch between `session.user.user_metadata.role` (`'seller'`) and `profile.role` (`'buyer'`).
     - It issues an explicit `.update({ role: 'seller' })` against the `profiles` table to overwrite the default inheritance.
     - Additionally, the handler verifies the existence of the seller's store in the `stores` table and inserts the record seamlessly using the captured metadata (`store_name`, `store_description`), resolving previously observed RLS (Row Level Security) violations during sign-up.
   - **Post-Registration State:** Once logged in, the Seller assumes the proper `seller` role with corresponding elevated privileges, fully isolated from default buyer access.

## RLS & Database Interactions
- A new user's initial state is constrained by Row Level Security (RLS). Because the `signUp` operation returns a session of `null` when email confirmations are required or rate limits are enforced, immediate updates to `profiles` and insertions into `stores` were failing with RLS errors.
- Syncing the database records using the logged-in session inside `AuthProvider.tsx` ensures RLS policies appropriately recognize the `auth.uid()`, granting write access to the user's own profile and store without violating security boundaries.
