-- Create profiles table for user roles and info
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'corretor' CHECK (role IN ('corretor', 'gestor')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'qualificado', 'visita', 'proposta', 'fechado', 'perdido')),
  source TEXT,
  value NUMERIC,
  notes TEXT,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area NUMERIC,
  photos TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lead_properties relationship table
CREATE TABLE public.lead_properties (
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (lead_id, property_id)
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is manager
CREATE OR REPLACE FUNCTION public.is_manager(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'gestor'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for leads
CREATE POLICY "Corretores see own leads, gestores see all" ON public.leads
  FOR SELECT USING (
    auth.uid() = assigned_to OR public.is_manager(auth.uid())
  );

CREATE POLICY "Corretores can create leads assigned to themselves" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = assigned_to);

CREATE POLICY "Users can update own leads, gestores can update all" ON public.leads
  FOR UPDATE USING (
    auth.uid() = assigned_to OR public.is_manager(auth.uid())
  );

CREATE POLICY "Users can delete own leads, gestores can delete all" ON public.leads
  FOR DELETE USING (
    auth.uid() = assigned_to OR public.is_manager(auth.uid())
  );

-- RLS Policies for properties
CREATE POLICY "All authenticated users can view properties" ON public.properties
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create properties" ON public.properties
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own properties, gestores can update all" ON public.properties
  FOR UPDATE USING (
    auth.uid() = created_by OR public.is_manager(auth.uid())
  );

-- RLS Policies for lead_properties
CREATE POLICY "Users can view lead_properties for accessible leads" ON public.lead_properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE id = lead_id AND (assigned_to = auth.uid() OR public.is_manager(auth.uid()))
    )
  );

CREATE POLICY "Users can manage lead_properties for own leads" ON public.lead_properties
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE id = lead_id AND (assigned_to = auth.uid() OR public.is_manager(auth.uid()))
    )
  );

-- RLS Policies for tasks
CREATE POLICY "Users see tasks for accessible leads" ON public.tasks
  FOR SELECT USING (
    auth.uid() = assigned_to OR 
    public.is_manager(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE id = lead_id AND assigned_to = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks for accessible leads" ON public.tasks
  FOR INSERT WITH CHECK (
    auth.uid() = assigned_to AND
    EXISTS (
      SELECT 1 FROM public.leads 
      WHERE id = lead_id AND (assigned_to = auth.uid() OR public.is_manager(auth.uid()))
    )
  );

CREATE POLICY "Users can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = assigned_to OR public.is_manager(auth.uid()));

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'corretor'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();