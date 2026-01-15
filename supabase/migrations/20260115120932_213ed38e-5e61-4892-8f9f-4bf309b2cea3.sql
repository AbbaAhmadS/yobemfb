-- Add approved_amount column to loan_applications for Credit department to enter approved amount
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS approved_amount numeric DEFAULT NULL;

-- Add decline_reason column to loan_applications for storing reason when declined
ALTER TABLE public.loan_applications
ADD COLUMN IF NOT EXISTS decline_reason text DEFAULT NULL;

-- Add decline_reason column to account_applications for storing reason when declined
ALTER TABLE public.account_applications
ADD COLUMN IF NOT EXISTS decline_reason text DEFAULT NULL;