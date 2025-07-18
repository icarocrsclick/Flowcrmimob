-- =====================================================
-- SETUP COMPLETO PARA CAMPANHAS DE MARKETING
-- Execute este código no Supabase Web > SQL Editor
-- =====================================================

-- 1. CRIAR TABELAS
-- Create campaigns table for marketing campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_actions table for campaign tasks/actions
CREATE TABLE IF NOT EXISTS public.campaign_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('captacao', 'atracao', 'engajamento', 'conversao', 'pos_venda')),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'circle',
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  file_url TEXT,
  external_link TEXT,
  completion_date TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_actions ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICAS DE SEGURANÇA
-- Policies for campaigns
DROP POLICY IF EXISTS "Users can view own campaigns, gestores can view all" ON public.campaigns;
CREATE POLICY "Users can view own campaigns, gestores can view all" 
ON public.campaigns 
FOR SELECT 
USING (
  auth.uid() = created_by OR public.is_manager(auth.uid())
);

DROP POLICY IF EXISTS "Users can create campaigns" ON public.campaigns;
CREATE POLICY "Users can create campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own campaigns, gestores can update all" ON public.campaigns;
CREATE POLICY "Users can update own campaigns, gestores can update all" 
ON public.campaigns 
FOR UPDATE 
USING (
  auth.uid() = created_by OR public.is_manager(auth.uid())
);

DROP POLICY IF EXISTS "Users can delete own campaigns, gestores can delete all" ON public.campaigns;
CREATE POLICY "Users can delete own campaigns, gestores can delete all" 
ON public.campaigns 
FOR DELETE 
USING (
  auth.uid() = created_by OR public.is_manager(auth.uid())
);

-- Policies for campaign_actions
DROP POLICY IF EXISTS "Users can view actions for accessible campaigns" ON public.campaign_actions;
CREATE POLICY "Users can view actions for accessible campaigns" 
ON public.campaign_actions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE id = campaign_actions.campaign_id 
    AND (created_by = auth.uid() OR public.is_manager(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Users can create actions for accessible campaigns" ON public.campaign_actions;
CREATE POLICY "Users can create actions for accessible campaigns" 
ON public.campaign_actions 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE id = campaign_actions.campaign_id 
    AND (created_by = auth.uid() OR public.is_manager(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Users can update actions for accessible campaigns" ON public.campaign_actions;
CREATE POLICY "Users can update actions for accessible campaigns" 
ON public.campaign_actions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE id = campaign_actions.campaign_id 
    AND (created_by = auth.uid() OR public.is_manager(auth.uid()))
  )
);

DROP POLICY IF EXISTS "Users can delete actions for accessible campaigns" ON public.campaign_actions;
CREATE POLICY "Users can delete actions for accessible campaigns" 
ON public.campaign_actions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE id = campaign_actions.campaign_id 
    AND (created_by = auth.uid() OR public.is_manager(auth.uid()))
  )
);

-- 4. CRIAR TRIGGERS PARA TIMESTAMPS
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaign_actions_updated_at ON public.campaign_actions;
CREATE TRIGGER update_campaign_actions_updated_at
BEFORE UPDATE ON public.campaign_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5. CONFIGURAR STORAGE
-- Criar bucket para arquivos de campanha (ignora erro se já existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'campaign-files', 
  'campaign-files', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'campaign-files'
);

-- 6. POLÍTICAS DE STORAGE
-- Limpar políticas existentes
DROP POLICY IF EXISTS "Authenticated users can upload campaign files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view campaign files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own campaign files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own campaign files" ON storage.objects;

-- Criar novas políticas
CREATE POLICY "Authenticated users can upload campaign files" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'campaign-files');

CREATE POLICY "Anyone can view campaign files" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'campaign-files');

CREATE POLICY "Users can update own campaign files" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'campaign-files');

CREATE POLICY "Users can delete own campaign files" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'campaign-files');

-- 7. VERIFICAÇÃO FINAL
-- Verificar se tudo foi criado corretamente
SELECT 
  'Tabelas criadas' as status,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('campaigns', 'campaign_actions')

UNION ALL

SELECT 
  'Bucket criado' as status,
  COUNT(*) as count
FROM storage.buckets 
WHERE id = 'campaign-files';

-- Mensagem de sucesso
SELECT 'Setup concluído com sucesso! 🎉' as message;