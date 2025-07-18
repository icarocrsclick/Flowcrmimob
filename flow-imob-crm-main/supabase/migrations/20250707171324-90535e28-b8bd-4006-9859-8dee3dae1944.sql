-- Create canvas_nodes table to store node positions and types
CREATE TABLE public.canvas_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('lead', 'property')),
  node_id UUID NOT NULL,
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, node_type, node_id)
);

-- Enable Row Level Security
ALTER TABLE public.canvas_nodes ENABLE ROW LEVEL SECURITY;

-- Create policies for canvas_nodes
CREATE POLICY "Users can view their own canvas nodes" 
ON public.canvas_nodes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own canvas nodes" 
ON public.canvas_nodes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canvas nodes" 
ON public.canvas_nodes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own canvas nodes" 
ON public.canvas_nodes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_canvas_nodes_updated_at
BEFORE UPDATE ON public.canvas_nodes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();