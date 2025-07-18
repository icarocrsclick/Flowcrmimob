-- Create campaigns table for marketing campaigns
CREATE TABLE public.campaigns (
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
CREATE TABLE public.campaign_actions (
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

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns
CREATE POLICY "Users can view own campaigns, gestores can view all" 
ON public.campaigns 
FOR SELECT 
USING (
  auth.uid() = created_by OR public.is_manager(auth.uid())
);

CREATE POLICY "Users can create campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own campaigns, gestores can update all" 
ON public.campaigns 
FOR UPDATE 
USING (
  auth.uid() = created_by OR public.is_manager(auth.uid())
);

CREATE POLICY "Users can delete own campaigns, gestores can delete all" 
ON public.campaigns 
FOR DELETE 
USING (
  auth.uid() = created_by OR public.is_manager(auth.uid())
);

-- Create policies for campaign_actions
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

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_actions_updated_at
BEFORE UPDATE ON public.campaign_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default campaign actions for each stage
INSERT INTO public.campaign_actions (campaign_id, stage, title, description, icon, user_id) 
SELECT 
  c.id,
  'captacao',
  'Fotos Profissionais',
  'Contratar fotógrafo profissional para o imóvel',
  'camera',
  c.created_by
FROM public.campaigns c
WHERE NOT EXISTS (
  SELECT 1 FROM public.campaign_actions ca 
  WHERE ca.campaign_id = c.id AND ca.stage = 'captacao' AND ca.title = 'Fotos Profissionais'
);