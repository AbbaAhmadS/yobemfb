import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoanFormProgress } from '@/components/loan-application/LoanFormProgress';
import { Step1BasicInfo } from '@/components/loan-application/Step1BasicInfo';
import { Step2Identification } from '@/components/loan-application/Step2Identification';
import { Step3LoanDetails } from '@/components/loan-application/Step3LoanDetails';
import { Step4Guarantor } from '@/components/loan-application/Step4Guarantor';
import { Step5Review } from '@/components/loan-application/Step5Review';
import { LoanStep1Data, LoanStep2Data, LoanStep3Data, GuarantorData } from '@/types/database';

export default function CreateApplication() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [applicationId, setApplicationId] = useState<string>('');

  // Form data state
  const [step1Data, setStep1Data] = useState<Partial<LoanStep1Data>>({});
  const [step2Data, setStep2Data] = useState<Partial<LoanStep2Data>>({});
  const [step3Data, setStep3Data] = useState<Partial<LoanStep3Data>>({});
  const [guarantorData, setGuarantorData] = useState<Partial<GuarantorData>>({});

  const handleStep1Submit = (data: LoanStep1Data) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: LoanStep2Data) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  const handleStep3Submit = (data: LoanStep3Data) => {
    setStep3Data(data);
    setCurrentStep(4);
  };

  const handleStep4Submit = (data: GuarantorData) => {
    setGuarantorData(data);
    setCurrentStep(5);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to submit an application');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate application ID
      const { data: appIdData, error: appIdError } = await supabase.rpc('generate_application_id', {
        prefix: 'LN',
      });

      if (appIdError) throw appIdError;

      const newApplicationId = appIdData;

      // Create loan application (created by admin on behalf of customer)
      const { data: loanApp, error: loanError } = await supabase
        .from('loan_applications')
        .insert({
          application_id: newApplicationId,
          user_id: user.id,
          created_by_admin: user.id,
          full_name: step1Data.full_name!,
          phone_number: step1Data.phone_number!,
          address: step1Data.address!,
          ministry_department: step1Data.ministry_department!,
          employee_id: step1Data.employee_id!,
          passport_photo_url: step1Data.passport_photo_url!,
          application_type: step1Data.application_type!,
          bvn: step2Data.bvn!,
          nin: step2Data.nin!,
          nin_document_url: step2Data.nin_document_url!,
          signature_url: step2Data.signature_url!,
          payment_slip_url: step2Data.payment_slip_url!,
          product_type: step3Data.product_type!,
          loan_amount_range: step3Data.loan_amount_range!,
          specific_amount: step3Data.specific_amount!,
          repayment_period_months: step3Data.repayment_period_months!,
          bank_name: step3Data.bank_name!,
          bank_account_number: step3Data.bank_account_number!,
          terms_accepted: true,
          is_draft: false,
          current_step: 5,
          status: 'pending',
        })
        .select()
        .single();

      if (loanError) throw loanError;

      // Create guarantor record
      const { error: guarantorError } = await supabase.from('guarantors').insert({
        loan_application_id: loanApp.id,
        full_name: guarantorData.full_name!,
        phone_number: guarantorData.phone_number!,
        address: guarantorData.address!,
        organization: guarantorData.organization!,
        position: guarantorData.position!,
        employee_id: guarantorData.employee_id!,
        bvn: guarantorData.bvn!,
        salary: guarantorData.salary!,
        allowances: guarantorData.allowances || 0,
        other_income: guarantorData.other_income || 0,
        signature_url: guarantorData.signature_url!,
        acknowledged: guarantorData.acknowledged!,
      });

      if (guarantorError) throw guarantorError;

      setApplicationId(newApplicationId);
      setIsComplete(true);
      toast.success('Customer application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="card-elevated text-center">
          <CardHeader>
            <div className="mx-auto h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <CardTitle className="font-display text-2xl">Application Submitted!</CardTitle>
            <CardDescription className="text-base">
              Customer loan application has been successfully submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Application ID</p>
              <p className="text-xl font-mono font-bold text-primary">{applicationId}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              The application is now in the queue for review.
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => navigate('/admin/credit-dashboard')}>
                Back to Dashboard
              </Button>
              <Button onClick={() => {
                setIsComplete(false);
                setCurrentStep(1);
                setStep1Data({});
                setStep2Data({});
                setStep3Data({});
                setGuarantorData({});
              }}>
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/credit-dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Customer Loan Application</h1>
          <p className="text-muted-foreground">Create application on behalf of a customer</p>
        </div>
      </div>

      <Card className="card-elevated">
        <CardContent className="p-6 md:p-8">
          <LoanFormProgress currentStep={currentStep} />

          {currentStep === 1 && <Step1BasicInfo initialData={step1Data} onSubmit={handleStep1Submit} />}

          {currentStep === 2 && (
            <Step2Identification initialData={step2Data} onSubmit={handleStep2Submit} onBack={handleBack} />
          )}

          {currentStep === 3 && (
            <Step3LoanDetails initialData={step3Data} onSubmit={handleStep3Submit} onBack={handleBack} />
          )}

          {currentStep === 4 && (
            <Step4Guarantor initialData={guarantorData} onSubmit={handleStep4Submit} onBack={handleBack} />
          )}

          {currentStep === 5 && (
            <Step5Review
              step1Data={step1Data as LoanStep1Data}
              step2Data={step2Data as LoanStep2Data}
              step3Data={step3Data as LoanStep3Data}
              guarantorData={guarantorData as GuarantorData}
              onSubmit={handleFinalSubmit}
              onBack={handleBack}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
