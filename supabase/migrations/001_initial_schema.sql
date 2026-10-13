-- ==============================================================================
-- AGENDAR: SCHEMA DE BASE DE DATOS COMPLETO CON RLS PARA SUPABASE (POSTGRESQL)
-- ==============================================================================

-- 1. Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Perfiles de usuario vinculados a auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  google_calendar_linked BOOLEAN DEFAULT FALSE,
  google_calendar_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Espacios de trabajo (Workspaces)
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🚀',
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Miembros del Workspace y Roles (Colaboración)
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- 5. Enlaces e invitaciones para unirse a un Workspace
CREATE TABLE IF NOT EXISTS public.workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'guest')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Páginas (Jerárquicas, Bóvedas Cifradas o Proyectos Privados)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Sin título',
  icon TEXT,
  cover_image TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_encrypted BOOLEAN DEFAULT FALSE, -- Bóveda Zero-Knowledge E2EE
  is_private BOOLEAN DEFAULT FALSE,   -- Proyecto privado (solo visible para su creador)
  encryption_salt TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bloques de Contenido (Block-based Engine)
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  parent_block_id UUID REFERENCES public.blocks(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  checked BOOLEAN DEFAULT FALSE,
  collapsed BOOLEAN DEFAULT FALSE,
  language TEXT,
  icon TEXT,
  color TEXT,
  position INTEGER DEFAULT 0,
  calendar_event_id TEXT,
  calendar_event_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bases de Datos Dinámicas Embebidas
CREATE TABLE IF NOT EXISTS public.database_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Nueva Base de Datos',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.database_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  database_id UUID REFERENCES public.database_collections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  position INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.database_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  database_id UUID REFERENCES public.database_collections(id) ON DELETE CASCADE,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Configuración de Inteligencia Artificial del Usuario (BYOK)
CREATE TABLE IF NOT EXISTS public.user_ai_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  gemini_api_key TEXT,
  claude_api_key TEXT,
  openai_api_key TEXT,
  preferred_model TEXT DEFAULT 'gemini-1.5-flash',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_settings ENABLE ROW LEVEL SECURITY;

-- Politicas para Profiles
CREATE POLICY "Users can view all member profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Politicas para Workspaces
CREATE POLICY "Workspace members can view workspace"
  ON public.workspaces FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspaces.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update workspace"
  ON public.workspaces FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces"
  ON public.workspaces FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Politicas para Workspace Members
CREATE POLICY "Members can view other members"
  ON public.workspace_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id AND wm.user_id = auth.uid()
    )
  );

-- Politicas para Pages (Manejo de Proyectos Privados)
CREATE POLICY "Members can view public workspace pages or own private pages"
  ON public.pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = pages.workspace_id AND user_id = auth.uid()
    )
    AND (
      is_private = FALSE OR created_by = auth.uid()
    )
  );

CREATE POLICY "Workspace members can insert pages"
  ON public.pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = pages.workspace_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Page creators and admins can update pages"
  ON public.pages FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = pages.workspace_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Politicas para Bloques
CREATE POLICY "Users can read blocks of accessible pages"
  ON public.blocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE id = blocks.page_id
    )
  );

CREATE POLICY "Users can write blocks of accessible pages"
  ON public.blocks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE id = blocks.page_id
    )
  );

-- Politicas para AI Settings (Solo el usuario lee/edita sus propias claves)
CREATE POLICY "Users manage their own AI keys"
  ON public.user_ai_settings FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Habilitar Publicación en Tiempo Real para Tablas Colaborativas
ALTER PUBLICATION supabase_realtime ADD TABLE public.pages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.database_rows;
