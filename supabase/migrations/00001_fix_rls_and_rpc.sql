-- 1. Secure the profiles table RLS policies
-- Prevent users from updating their own role directly to prevent privilege escalation
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile (excluding role)"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  -- We don't allow changing the role directly via client update. 
  -- If you need to restrict columns in RLS, it's better done via GRANTS or a trigger.
  -- A simpler way in Supabase is to revoke UPDATE on the 'role' column, but that can be complex.
  -- Alternatively, we can just use an RPC for role updates and deny role changes in a trigger.
);

-- Trigger to prevent role updates via standard client queries
CREATE OR REPLACE FUNCTION prevent_role_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Only allow role changes if it's done by an admin or service role (bypassing RLS)
    -- In Supabase, the authenticated role is 'authenticated'. Service role is 'service_role'
    IF current_setting('role') = 'authenticated' THEN
      RAISE EXCEPTION 'You are not allowed to update your role directly.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_role_update_trigger ON public.profiles;
CREATE TRIGGER prevent_role_update_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_role_update();


-- 2. Create a secure RPC for upgrading a buyer to a seller
CREATE OR REPLACE FUNCTION upgrade_to_seller(store_name text, store_desc text)
RETURNS void
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Update the profile to seller (since this function is SECURITY DEFINER, it bypasses the RLS trigger if we use a different role, 
  -- actually wait, SECURITY DEFINER runs as the owner of the function (usually postgres), which bypasses the current_setting('role') check!)
  UPDATE public.profiles SET role = 'seller' WHERE id = v_user_id;

  -- Insert the store
  INSERT INTO public.stores (id, name, description)
  VALUES (v_user_id, store_name, store_desc)
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
