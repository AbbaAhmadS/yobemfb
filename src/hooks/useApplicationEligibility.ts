import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EligibilityStatus {
  canApply: boolean;
  reason?: string;
  nextEligibleDate?: Date;
  lastApplication?: {
    status: string;
    repayment_period_months: number;
    created_at: string;
  };
}

export function useApplicationEligibility() {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState<EligibilityStatus>({ canApply: true });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkEligibility = async () => {
      try {
        // Get user's loan applications ordered by most recent
        const { data: applications, error } = await supabase
          .from('loan_applications')
          .select('id, status, repayment_period_months, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (!applications || applications.length === 0) {
          // No previous applications - can apply
          setEligibility({ canApply: true });
          setIsLoading(false);
          return;
        }

        const lastApp = applications[0];

        // Check if last application is still being processed
        if (['pending', 'under_review', 'flagged'].includes(lastApp.status)) {
          setEligibility({
            canApply: false,
            reason: 'Your previous application is still being processed. Please wait for a decision before applying again.',
            lastApplication: lastApp
          });
          setIsLoading(false);
          return;
        }

        // If declined, can apply again immediately
        if (lastApp.status === 'declined') {
          setEligibility({ canApply: true });
          setIsLoading(false);
          return;
        }

        // If approved, check if repayment period has elapsed
        if (lastApp.status === 'approved') {
          const approvalDate = new Date(lastApp.created_at);
          const repaymentMonths = lastApp.repayment_period_months || 3;
          const eligibleDate = new Date(approvalDate);
          eligibleDate.setMonth(eligibleDate.getMonth() + repaymentMonths);

          const now = new Date();

          if (now < eligibleDate) {
            setEligibility({
              canApply: false,
              reason: `You can apply for a new loan after your current repayment period ends.`,
              nextEligibleDate: eligibleDate,
              lastApplication: lastApp
            });
          } else {
            setEligibility({ canApply: true });
          }
        }
      } catch (error) {
        console.error('Error checking eligibility:', error);
        // On error, allow application (fail open for UX, backend will validate)
        setEligibility({ canApply: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkEligibility();
  }, [user]);

  return { eligibility, isLoading };
}
