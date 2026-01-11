import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SignedImage } from '@/components/ui/signed-image';
import { LoanStep1Data, LoanStep2Data, LoanStep3Data, GuarantorData, LOAN_AMOUNT_LABELS } from '@/types/database';
import { ArrowLeft, Send, User, FileText, CreditCard, Users, Loader2 } from 'lucide-react';

interface Step5Props {
  step1Data: LoanStep1Data;
  step2Data: LoanStep2Data;
  step3Data: LoanStep3Data;
  guarantorData: GuarantorData;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function Step5Review({
  step1Data,
  step2Data,
  step3Data,
  guarantorData,
  onSubmit,
  onBack,
  isSubmitting,
}: Step5Props) {
  const [termsAccepted, setTermsAccepted] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-display font-semibold">Review Your Application</h2>
        <p className="text-muted-foreground mt-1">
          Please review all the information before submitting
        </p>
      </div>

      {/* Important Warning */}
      <div className="p-4 rounded-lg border-2 border-warning bg-warning/10">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-warning-foreground">Important Notice</p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>You will NOT be able to edit your application once submitted.</strong> Please carefully review all information above to ensure everything is correct before proceeding.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Full Name:</span>
              <p className="font-medium">{step1Data.full_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>
              <p className="font-medium">{step1Data.phone_number}</p>
            </div>
            <div>
              <span className="text-muted-foreground">MDA:</span>
              <p className="font-medium">{step1Data.ministry_department}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Employee ID:</span>
              <p className="font-medium">{step1Data.employee_id}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Address:</span>
              <p className="font-medium">{step1Data.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Identification */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">BVN:</span>
              <p className="font-medium">{step2Data.bvn}</p>
            </div>
            <div>
              <span className="text-muted-foreground">NIN:</span>
              <p className="font-medium">{step2Data.nin}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <span className="text-muted-foreground block">Passport Photo</span>
                <SignedImage 
                  storedPath={step1Data.passport_photo_url} 
                  bucket="loan-uploads"
                  alt="Passport" 
                  className="h-16 w-16 rounded-lg object-cover mt-1"
                />
              </div>
              <div>
                <span className="text-muted-foreground block">Signature</span>
                <SignedImage 
                  storedPath={step2Data.signature_url}
                  bucket="loan-uploads"
                  alt="Signature" 
                  className="h-16 rounded-lg object-contain mt-1 bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Loan Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Product Type:</span>
              <p className="font-medium capitalize">
                {step3Data.product_type.replace('_', ' ')} Loan
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Amount Range:</span>
              <p className="font-medium">
                {LOAN_AMOUNT_LABELS[step3Data.loan_amount_range]}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Specific Amount:</span>
              <p className="font-medium">{formatAmount(step3Data.specific_amount)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Repayment Period:</span>
              <p className="font-medium">{step3Data.repayment_period_months} Months</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bank Name:</span>
              <p className="font-medium">{step3Data.bank_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Account Number:</span>
              <p className="font-medium">{step3Data.bank_account_number}</p>
            </div>
          </CardContent>
        </Card>

        {/* Guarantor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Guarantor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Full Name:</span>
              <p className="font-medium">{guarantorData.full_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>
              <p className="font-medium">{guarantorData.phone_number}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Organization:</span>
              <p className="font-medium">{guarantorData.organization}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Position:</span>
              <p className="font-medium">{guarantorData.position}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Monthly Salary:</span>
              <p className="font-medium">{formatAmount(guarantorData.salary)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">BVN:</span>
              <p className="font-medium">{guarantorData.bvn}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terms & Conditions */}
      <div className="flex items-start space-x-3 rounded-lg border p-4 bg-muted/30">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
        />
        <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
          I confirm that all the information provided is accurate and complete. 
          I understand that providing false information may result in the rejection 
          of my application and may be subject to legal action. I agree to the{' '}
          <a href="/terms" target="_blank" className="text-primary underline">
            Terms and Conditions
          </a>{' '}
          of Yobe Microfinance Bank.
        </label>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          size="lg" 
          onClick={onSubmit}
          disabled={!termsAccepted || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Application
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
