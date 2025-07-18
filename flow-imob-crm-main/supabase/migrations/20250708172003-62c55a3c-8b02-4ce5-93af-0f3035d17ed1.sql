-- Create captacoes table for property acquisition tracking
CREATE TABLE public.captacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assigned_to UUID NOT NULL,
  owner_name TEXT NOT NULL,
  contact TEXT,
  address TEXT NOT NULL,
  property_type TEXT NOT NULL,
  estimated_value NUMERIC,
  documentation_status TEXT NOT NULL DEFAULT 'pendente',
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'prospeccao',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.captacoes ENABLE ROW LEVEL SECURITY;

-- Create policies for captacoes access
CREATE POLICY "Corretores can create captacoes assigned to themselves" 
ON public.captacoes 
FOR INSERT 
WITH CHECK (auth.uid() = assigned_to);

CREATE POLICY "Corretores see own captacoes, gestores see all" 
ON public.captacoes 
FOR SELECT 
USING ((auth.uid() = assigned_to) OR is_manager(auth.uid()));

CREATE POLICY "Users can update own captacoes, gestores can update all" 
ON public.captacoes 
FOR UPDATE 
USING ((auth.uid() = assigned_to) OR is_manager(auth.uid()));

CREATE POLICY "Users can delete own captacoes, gestores can delete all" 
ON public.captacoes 
FOR DELETE 
USING ((auth.uid() = assigned_to) OR is_manager(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_captacoes_updated_at
BEFORE UPDATE ON public.captacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();