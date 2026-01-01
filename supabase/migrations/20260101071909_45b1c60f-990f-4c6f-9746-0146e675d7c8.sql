-- Create enums for various statuses and types
CREATE TYPE public.app_role AS ENUM ('credit', 'audit', 'coo', 'operations', 'managing_director');
CREATE TYPE public.application_status AS ENUM ('pending', 'under_review', 'approved', 'declined', 'flagged');
CREATE TYPE public.loan_product_type AS ENUM ('short_term', 'long_term');
CREATE TYPE public.application_type AS ENUM ('internal', 'external');
CREATE TYPE public.loan_amount_range AS ENUM ('100k_300k', '300k_600k', '600k_1m', 'above_1m');
CREATE TYPE public.account_type AS ENUM ('savings', 'current', 'corporate');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  has_bank_account BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table for admin roles (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create account_applications table
CREATE TABLE public.account_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  passport_photo_url TEXT NOT NULL,
  account_type account_type NOT NULL,
  full_name TEXT NOT NULL,
  nin TEXT NOT NULL,
  bvn TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  nin_document_url TEXT NOT NULL,
  signature_url TEXT NOT NULL,
  referee1_name TEXT NOT NULL,
  referee1_phone TEXT NOT NULL,
  referee1_address TEXT NOT NULL,
  referee2_name TEXT NOT NULL,
  referee2_phone TEXT NOT NULL,
  referee2_address TEXT NOT NULL,
  status application_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create loan_applications table
CREATE TABLE public.loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_by_admin UUID REFERENCES auth.users(id), -- For "apply on behalf" feature
  
  -- Step 1: Basic Info
  passport_photo_url TEXT NOT NULL,
  product_type loan_product_type NOT NULL,
  application_type application_type NOT NULL,
  full_name TEXT NOT NULL,
  ministry_department TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  payment_slip_url TEXT NOT NULL,
  
  -- Step 2: Identification
  bvn TEXT NOT NULL,
  nin TEXT NOT NULL,
  nin_document_url TEXT NOT NULL,
  
  -- Step 3: Loan Details
  loan_amount_range loan_amount_range NOT NULL,
  specific_amount DECIMAL(12, 2) NOT NULL,
  repayment_period_months INTEGER NOT NULL,
  bank_account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  signature_url TEXT NOT NULL,
  terms_accepted BOOLEAN DEFAULT FALSE,
  
  -- Status and workflow
  status application_status DEFAULT 'pending',
  credit_approval BOOLEAN,
  credit_approved_by UUID REFERENCES auth.users(id),
  credit_approved_at TIMESTAMPTZ,
  audit_approval BOOLEAN,
  audit_approved_by UUID REFERENCES auth.users(id),
  audit_approved_at TIMESTAMPTZ,
  coo_approval BOOLEAN,
  coo_approved_by UUID REFERENCES auth.users(id),
  coo_approved_at TIMESTAMPTZ,
  
  notes TEXT,
  current_step INTEGER DEFAULT 1,
  is_draft BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create guarantors table
CREATE TABLE public.guarantors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID REFERENCES public.loan_applications(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  salary DECIMAL(12, 2) NOT NULL,
  allowances DECIMAL(12, 2) DEFAULT 0,
  other_income DECIMAL(12, 2) DEFAULT 0,
  employee_id TEXT NOT NULL,
  bvn TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  organization TEXT NOT NULL,
  position TEXT NOT NULL,
  signature_url TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create admin_actions table for audit trail
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  action_type TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  previous_status application_status,
  new_status application_status,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guarantors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = TRUE
      AND (locked_until IS NULL OR locked_until < NOW())
  )
$$;

-- Check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND is_active = TRUE
      AND (locked_until IS NULL OR locked_until < NOW())
  )
$$;

-- Function to generate unique application IDs
CREATE OR REPLACE FUNCTION public.generate_application_id(prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
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

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_account_applications_updated_at
  BEFORE UPDATE ON public.account_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON public.loan_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guarantors_updated_at
  BEFORE UPDATE ON public.guarantors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone_number, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone_number', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles (only admins and the user themselves can see)
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Managing director can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'managing_director'));

-- RLS Policies for account_applications
CREATE POLICY "Users can view their own account applications"
  ON public.account_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own account applications"
  ON public.account_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending account applications"
  ON public.account_applications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Operations can view all account applications"
  ON public.account_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'operations'));

CREATE POLICY "Operations can update account applications"
  ON public.account_applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'operations'));

CREATE POLICY "Managing director can view all account applications"
  ON public.account_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'managing_director'));

-- RLS Policies for loan_applications
CREATE POLICY "Users can view their own loan applications"
  ON public.loan_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loan applications"
  ON public.loan_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own draft applications"
  ON public.loan_applications FOR UPDATE
  USING (auth.uid() = user_id AND is_draft = TRUE);

CREATE POLICY "Credit can view all loan applications"
  ON public.loan_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'credit'));

CREATE POLICY "Credit can update loan applications"
  ON public.loan_applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'credit'));

CREATE POLICY "Credit can create loan applications on behalf"
  ON public.loan_applications FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'credit'));

CREATE POLICY "Audit can view all loan applications"
  ON public.loan_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'audit'));

CREATE POLICY "Audit can update loan applications"
  ON public.loan_applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'audit'));

CREATE POLICY "COO can view all loan applications"
  ON public.loan_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'coo'));

CREATE POLICY "COO can update loan applications"
  ON public.loan_applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'coo'));

CREATE POLICY "Managing director can view all loan applications"
  ON public.loan_applications FOR SELECT
  USING (public.has_role(auth.uid(), 'managing_director'));

-- RLS Policies for guarantors
CREATE POLICY "Users can view guarantors for their applications"
  ON public.guarantors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.loan_applications
      WHERE id = loan_application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create guarantors for their applications"
  ON public.guarantors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.loan_applications
      WHERE id = loan_application_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update guarantors for their draft applications"
  ON public.guarantors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.loan_applications
      WHERE id = loan_application_id AND user_id = auth.uid() AND is_draft = TRUE
    )
  );

CREATE POLICY "Admins can view all guarantors"
  ON public.guarantors FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Credit can create guarantors on behalf"
  ON public.guarantors FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'credit'));

-- RLS Policies for admin_actions
CREATE POLICY "Admins can create action logs"
  ON public.admin_actions FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Managing director can view all action logs"
  ON public.admin_actions FOR SELECT
  USING (public.has_role(auth.uid(), 'managing_director'));

CREATE POLICY "Admins can view their own actions"
  ON public.admin_actions FOR SELECT
  USING (admin_user_id = auth.uid());

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('passport-photos', 'passport-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', false);

-- Storage policies for documents bucket
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND public.is_admin(auth.uid()));

-- Storage policies for passport-photos bucket (public bucket)
CREATE POLICY "Anyone can view passport photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'passport-photos');

CREATE POLICY "Users can upload their own passport photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'passport-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can upload passport photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'passport-photos' AND public.is_admin(auth.uid()));

-- Storage policies for signatures bucket
CREATE POLICY "Users can upload their own signatures"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own signatures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all signatures"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'signatures' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins can upload signatures"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'signatures' AND public.is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_loan_applications_user_id ON public.loan_applications(user_id);
CREATE INDEX idx_loan_applications_status ON public.loan_applications(status);
CREATE INDEX idx_loan_applications_application_id ON public.loan_applications(application_id);
CREATE INDEX idx_account_applications_user_id ON public.account_applications(user_id);
CREATE INDEX idx_account_applications_status ON public.account_applications(status);
CREATE INDEX idx_guarantors_loan_application_id ON public.guarantors(loan_application_id);
CREATE INDEX idx_admin_actions_admin_user_id ON public.admin_actions(admin_user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);