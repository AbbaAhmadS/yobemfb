import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoanStep3Data, LoanAmountRange, LoanProductType, LOAN_AMOUNT_LABELS, AccountType } from '@/types/database';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const step3Schema = z.object({
  product_type: z.enum(['short_term', 'long_term']),
  loan_amount_range: z.enum(['100k_300k', '300k_600k', '600k_1m', 'above_1m']),
  specific_amount: z.number().min(100000, 'Minimum amount is ₦100,000'),
  repayment_period_months: z.number().min(9).max(12),
  bank_name: z.enum(['savings', 'current', 'corporate']), // Now account type
  bank_account_number: z.string().length(10, 'Account number must be 10 digits'),
});

interface Step3Props {
  initialData: Partial<LoanStep3Data>;
  onSubmit: (data: LoanStep3Data) => void;
  onBack: () => void;
}

export function Step3LoanDetails({ initialData, onSubmit, onBack }: Step3Props) {
  const form = useForm<LoanStep3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      product_type: initialData.product_type || 'short_term',
      loan_amount_range: initialData.loan_amount_range || '100k_300k',
      specific_amount: initialData.specific_amount || 100000,
      repayment_period_months: initialData.repayment_period_months || 9,
      bank_name: initialData.bank_name || '',
      bank_account_number: initialData.bank_account_number || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="product_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loan Product Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select loan type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="short_term">Short Term Loan</SelectItem>
                  <SelectItem value="long_term">Long Term Loan</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="loan_amount_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Amount Range</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select amount range" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(LOAN_AMOUNT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specific_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specific Amount (₦)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder="Enter exact amount needed"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="repayment_period_months"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repayment Period (Months)</FormLabel>
              <Select 
                onValueChange={(v) => field.onChange(Number(v))} 
                defaultValue={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select repayment period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="9">9 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-6 mt-6">
          <h3 className="font-medium mb-2">Disbursement Account</h3>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enter your YobeMFB bank account where you want the loan to be disbursed. 
              The loan will only be disbursed into a YobeMFB bank account.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YobeMFB Account Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="savings">Savings Account</SelectItem>
                      <SelectItem value="current">Current Account</SelectItem>
                      <SelectItem value="corporate">Corporate Account</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Your YobeMFB account type</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bank_account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YobeMFB Account Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter 10-digit account number" 
                      maxLength={10}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Your YobeMFB account number for disbursement</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button type="submit" size="lg">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
