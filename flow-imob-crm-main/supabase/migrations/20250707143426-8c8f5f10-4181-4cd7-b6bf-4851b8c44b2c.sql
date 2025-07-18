-- Update RLS policy for properties to restrict access to user's own properties
DROP POLICY IF EXISTS "All authenticated users can view properties" ON public.properties;

CREATE POLICY "Users can view own properties, gestores can view all" ON public.properties
  FOR SELECT USING (
    auth.uid() = created_by OR public.is_manager(auth.uid())
  );

-- Add policy to allow users to delete their own properties
CREATE POLICY "Users can delete own properties, gestores can delete all" ON public.properties
  FOR DELETE USING (
    auth.uid() = created_by OR public.is_manager(auth.uid())
  );