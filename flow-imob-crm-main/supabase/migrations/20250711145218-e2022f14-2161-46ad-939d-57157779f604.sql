-- Create table for property document checklist
CREATE TABLE public.documentos_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  imovel_id UUID NOT NULL,
  tipo_documento TEXT NOT NULL,
  marcado BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL,
  data_marcado TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (imovel_id, tipo_documento)
);

-- Enable RLS
ALTER TABLE public.documentos_checklist ENABLE ROW LEVEL SECURITY;

-- Create policies for checklist access
CREATE POLICY "Users can view checklist for accessible properties" 
ON public.documentos_checklist 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.captacoes 
    WHERE id = documentos_checklist.imovel_id 
    AND (assigned_to = auth.uid() OR is_manager(auth.uid()))
  )
);

CREATE POLICY "Users can create checklist for accessible properties" 
ON public.documentos_checklist 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.captacoes 
    WHERE id = documentos_checklist.imovel_id 
    AND (assigned_to = auth.uid() OR is_manager(auth.uid()))
  )
);

CREATE POLICY "Users can update checklist for accessible properties" 
ON public.documentos_checklist 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.captacoes 
    WHERE id = documentos_checklist.imovel_id 
    AND (assigned_to = auth.uid() OR is_manager(auth.uid()))
  )
);

CREATE POLICY "Users can delete checklist for accessible properties" 
ON public.documentos_checklist 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.captacoes 
    WHERE id = documentos_checklist.imovel_id 
    AND (assigned_to = auth.uid() OR is_manager(auth.uid()))
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_documentos_checklist_updated_at
BEFORE UPDATE ON public.documentos_checklist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();