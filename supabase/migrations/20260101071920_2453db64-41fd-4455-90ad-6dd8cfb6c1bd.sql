-- Fix search_path for generate_application_id function
CREATE OR REPLACE FUNCTION public.generate_application_id(prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  year_suffix TEXT;
  random_part TEXT;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YY');
  random_part := LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  new_id := prefix || year_suffix || random_part;
  RETURN new_id;
END;
$$;

-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;