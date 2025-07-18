-- Create storage bucket for property documents
INSERT INTO storage.buckets (id, name, public) VALUES ('property-documents', 'property-documents', false);

-- Create table for property documents
CREATE TABLE public.documentos_imovel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  imovel_id UUID NOT NULL,
  tipo_documento TEXT NOT NULL,
  url TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  data_upload TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documentos_imovel ENABLE ROW LEVEL SECURITY;

-- Create policies for documents access
CREATE POLICY "Users can view documents for accessible properties" 
ON public.documentos_imovel 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.captacoes 
    WHERE id = documentos_imovel.imovel_id 
    AND (assigned_to = auth.uid() OR is_manager(auth.uid()))
  )
);

CREATE POLICY "Users can create documents for accessible properties" 
ON public.documentos_imovel 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.captacoes 
    WHERE id = documentos_imovel.imovel_id 
    AND (assigned_to = auth.uid() OR is_manager(auth.uid()))
  )
);

CREATE POLICY "Users can update documents for accessible properties" 
ON public.documentos_imovel 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.captacoes 
    WHERE id = documentos_imovel.imovel_id 
    AND (assigned_to = auth.uid() OR is_manager(auth.uid()))
  )
);

CREATE POLICY "Users can delete documents for accessible properties" 
ON public.documentos_imovel 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.captacoes 
    WHERE id = documentos_imovel.imovel_id 
    AND (assigned_to = auth.uid() OR is_manager(auth.uid()))
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_documentos_imovel_updated_at
BEFORE UPDATE ON public.documentos_imovel
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage policies for property documents
CREATE POLICY "Users can view documents for accessible properties" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'property-documents' AND
  EXISTS (
    SELECT 1 FROM public.documentos_imovel d
    JOIN public.captacoes c ON d.imovel_id = c.id
    WHERE d.url = storage.objects.name 
    AND (c.assigned_to = auth.uid() OR is_manager(auth.uid()))
  )
);

CREATE POLICY "Users can upload documents for accessible properties" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'property-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update documents for accessible properties" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'property-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete documents for accessible properties" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'property-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);