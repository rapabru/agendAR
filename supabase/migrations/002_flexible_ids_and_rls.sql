-- ==============================================================================
-- AGENDAR: MIGRACIÓN 002 - CORRECCIÓN DE POLÍTICAS RLS, IDS FLEXIBLES Y WORKSPACE PERSONAL
-- ==============================================================================

-- 1. Permitir IDs flexibles (TEXT) en páginas y bloques para compatibilidad total
ALTER TABLE public.blocks DROP CONSTRAINT IF EXISTS blocks_page_id_fkey;
ALTER TABLE public.blocks DROP CONSTRAINT IF EXISTS blocks_parent_block_id_fkey;
ALTER TABLE public.pages DROP CONSTRAINT IF EXISTS pages_parent_id_fkey;
ALTER TABLE public.database_collections DROP CONSTRAINT IF EXISTS database_collections_page_id_fkey;

ALTER TABLE public.pages ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.pages ALTER COLUMN parent_id TYPE TEXT;
ALTER TABLE public.blocks ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.blocks ALTER COLUMN page_id TYPE TEXT;
ALTER TABLE public.blocks ALTER COLUMN parent_block_id TYPE TEXT;
ALTER TABLE public.database_collections ALTER COLUMN page_id TYPE TEXT;

ALTER TABLE public.pages ADD CONSTRAINT pages_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.pages(id) ON DELETE CASCADE;
ALTER TABLE public.blocks ADD CONSTRAINT blocks_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE CASCADE;
ALTER TABLE public.blocks ADD CONSTRAINT blocks_parent_block_id_fkey FOREIGN KEY (parent_block_id) REFERENCES public.blocks(id) ON DELETE CASCADE;
ALTER TABLE public.database_collections ADD CONSTRAINT database_collections_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE CASCADE;

-- 2. Corregir y completar políticas RLS para workspace_members
DROP POLICY IF EXISTS "Members can view other members" ON public.workspace_members;
CREATE POLICY "Users can view workspace members"
  ON public.workspace_members FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert workspace members" ON public.workspace_members;
CREATE POLICY "Users can insert workspace members"
  ON public.workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can update workspace members" ON public.workspace_members;
CREATE POLICY "Owners can update workspace members"
  ON public.workspace_members FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Owners can delete workspace members" ON public.workspace_members;
CREATE POLICY "Owners can delete workspace members"
  ON public.workspace_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.workspaces WHERE id = workspace_id AND owner_id = auth.uid()
  ));

-- 3. Corregir políticas RLS para Pages (permitir tanto páginas personales como de workspace)
DROP POLICY IF EXISTS "Members can view public workspace pages or own private pages" ON public.pages;
CREATE POLICY "Users can view accessible pages"
  ON public.pages FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = pages.workspace_id AND user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Workspace members can insert pages" ON public.pages;
CREATE POLICY "Users can insert pages"
  ON public.pages FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() OR
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Page creators and admins can update pages" ON public.pages;
CREATE POLICY "Users can update their pages"
  ON public.pages FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = pages.workspace_id AND user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can delete their pages" ON public.pages;
CREATE POLICY "Users can delete their pages"
  ON public.pages FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = pages.workspace_id AND user_id = auth.uid()
    ))
  );

-- 4. Corregir políticas RLS para Blocks
DROP POLICY IF EXISTS "Users can read blocks of accessible pages" ON public.blocks;
CREATE POLICY "Users can read blocks"
  ON public.blocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.pages WHERE id = blocks.page_id AND (
      created_by = auth.uid() OR workspace_id IS NULL OR EXISTS (
        SELECT 1 FROM public.workspace_members WHERE workspace_id = pages.workspace_id AND user_id = auth.uid()
      )
    ))
  );

DROP POLICY IF EXISTS "Users can write blocks of accessible pages" ON public.blocks;
CREATE POLICY "Users can write blocks"
  ON public.blocks FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.pages WHERE id = blocks.page_id AND (
      created_by = auth.uid() OR workspace_id IS NULL OR EXISTS (
        SELECT 1 FROM public.workspace_members WHERE workspace_id = pages.workspace_id AND user_id = auth.uid()
      )
    ))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.pages WHERE id = blocks.page_id AND (
      created_by = auth.uid() OR workspace_id IS NULL OR EXISTS (
        SELECT 1 FROM public.workspace_members WHERE workspace_id = pages.workspace_id AND user_id = auth.uid()
      )
    ))
  );

-- 5. Trigger para crear automáticamente Workspace Personal en cada nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user_workspace()
RETURNS TRIGGER AS $$
DECLARE
  new_ws_id UUID;
BEGIN
  -- Crear workspace personal
  INSERT INTO public.workspaces (name, icon, owner_id)
  VALUES ('Mi Espacio Personal', '🏠', NEW.id)
  RETURNING id INTO new_ws_id;

  -- Agregar al usuario como owner
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_ws_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_workspace ON auth.users;
CREATE TRIGGER on_auth_user_created_workspace
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_workspace();
