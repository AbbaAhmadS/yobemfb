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
} from '@/components/ui/form';
import { FileUpload } from './FileUpload';
import { LoanStep2Data } from '@/types/database';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const step2Schema = z.object({
  bvn: z.string().length(11, 'BVN must be 11 digits'),
  nin: z.string().length(11, 'NIN must be 11 digits'),
  nin_document_url: z.string().min(1, 'NIN document is required'),
  signature_url: z.string().min(1, 'Signature is required'),
  payment_slip_url: z.string().min(1, 'Payment slip is required'),
});

interface Step2Props {
  initialData: Partial<LoanStep2Data>;
  onSubmit: (data: LoanStep2Data) => void;
  onBack: () => void;
}

export function Step2Identification({ initialData, onSubmit, onBack }: Step2Props) {
  const form = useForm<LoanStep2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      bvn: initialData.bvn || '',
      nin: initialData.nin || '',
      nin_document_url: initialData.nin_document_url || '',
      signature_url: initialData.signature_url || '',
      payment_slip_url: initialData.payment_slip_url || '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="bvn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bank Verification Number (BVN)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your 11-digit BVN" 
                    maxLength={11}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>National Identification Number (NIN)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your 11-digit NIN" 
                    maxLength={11}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="nin_document_url"
          render={({ field }) => (
            <FormItem>
              <FileUpload
                bucket="documents"
                folder="nin-documents"
                accept="image/jpeg,image/jpg,image/png"
                label="NIN Slip / National ID Card *"
                description="Upload a clear image of your NIN document (JPG, PNG - max 200KB)"
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_slip_url"
          render={({ field }) => (
            <FormItem>
              <FileUpload
                bucket="documents"
                folder="payment-slips"
                accept="image/jpeg,image/jpg,image/png"
                label="Recent Payment Slip / Salary Advice *"
                description="Upload your most recent salary payment slip (JPG, PNG - max 200KB)"
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="signature_url"
          render={({ field }) => (
            <FormItem>
              <FileUpload
                bucket="signatures"
                folder="loan-applications"
                accept="image/jpeg,image/jpg,image/png"
                label="Signature *"
                description="Upload a clear image of your signature on white background (JPG, PNG - max 200KB)"
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

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
