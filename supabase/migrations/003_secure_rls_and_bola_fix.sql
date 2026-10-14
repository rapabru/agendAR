-- ==============================================================================
-- AGENDAR: MIGRATION 003 - SECURITY HARDENING & RLS BOLA / IDOR FIX
-- ==============================================================================

-- 1. Corregir Política de Inserción de Páginas (Evitar suplantación de created_by)
DROP POLICY IF EXISTS "Users can insert pages" ON public.pages;
CREATE POLICY "Users can insert pages"
  ON public.pages FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
  );

-- 2. Corregir Política de Lectura de Bloques
-- ELIMINAR `OR workspace_id IS NULL` que permitía a cualquier usuario leer notas personales de otros!
DROP POLICY IF EXISTS "Users can read blocks" ON public.blocks;
CREATE POLICY "Users can read blocks"
  ON public.blocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE id = blocks.page_id AND (
        created_by = auth.uid() OR
        (workspace_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.workspace_members
          WHERE workspace_id = pages.workspace_id AND user_id = auth.uid()
        ))
      )
    )
  );

-- 3. Corregir Política de Escritura/Modificación/Eliminación de Bloques
-- ELIMINAR `OR workspace_id IS NULL` que permitía a cualquier usuario alterar o borrar notas personales de otros!
DROP POLICY IF EXISTS "Users can write blocks" ON public.blocks;
CREATE POLICY "Users can write blocks"
  ON public.blocks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE id = blocks.page_id AND (
        created_by = auth.uid() OR
        (workspace_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.workspace_members
          WHERE workspace_id = pages.workspace_id AND user_id = auth.uid()
        ))
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE id = blocks.page_id AND (
        created_by = auth.uid() OR
        (workspace_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.workspace_members
          WHERE workspace_id = pages.workspace_id AND user_id = auth.uid()
        ))
      )
    )
  );
