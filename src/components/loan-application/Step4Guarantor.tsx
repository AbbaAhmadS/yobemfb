import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FileUpload } from './FileUpload';
import { GuarantorData } from '@/types/database';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const guarantorSchema = z.object({
  full_name: z.string().min(3, 'Full name is required'),
  phone_number: z.string().min(11, 'Valid phone number is required'),
  address: z.string().min(10, 'Complete address is required'),
  organization: z.string().min(2, 'Organization is required'),
  position: z.string().min(2, 'Position is required'),
  employee_id: z.string().min(1, 'Employee ID is required'),
  bvn: z.string().length(11, 'BVN must be 11 digits'),
  salary: z.number().min(50000, 'Salary must be at least ₦50,000'),
  allowances: z.number().optional(),
  other_income: z.number().optional(),
  signature_url: z.string().min(1, 'Signature is required'),
});

interface Step4Props {
  initialData: Partial<GuarantorData>;
  onSubmit: (data: GuarantorData) => void;
  onBack: () => void;
}

export function Step4Guarantor({ initialData, onSubmit, onBack }: Step4Props) {
  const form = useForm<GuarantorData>({
    resolver: zodResolver(guarantorSchema),
    defaultValues: {
      full_name: initialData.full_name || '',
      phone_number: initialData.phone_number || '',
      address: initialData.address || '',
      organization: initialData.organization || '',
      position: initialData.position || '',
      employee_id: initialData.employee_id || '',
      bvn: initialData.bvn || '',
      salary: initialData.salary || 0,
      allowances: initialData.allowances || 0,
      other_income: initialData.other_income || 0,
      signature_url: initialData.signature_url || '',
      acknowledged: true, // Always true now
    },
  });

  const handleSubmit = (data: GuarantorData) => {
    // Ensure acknowledged is always true
    onSubmit({ ...data, acknowledged: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your guarantor must be a civil servant with verifiable employment. 
            The guarantor's information will be verified before loan approval.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guarantor Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter guarantor's full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="08012345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Residential Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter guarantor's complete address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization/Ministry</FormLabel>
                <FormControl>
                  <Input placeholder="Enter organization name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position/Designation</FormLabel>
                <FormControl>
                  <Input placeholder="Enter position" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID / Staff Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter staff ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bvn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BVN</FormLabel>
                <FormControl>
                  <Input placeholder="Enter 11-digit BVN" maxLength={11} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="border-t pt-6 mt-6">
          <h3 className="font-medium mb-4">Income Information</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Salary (₦)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="e.g. 150000"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowances"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allowances (₦)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="e.g. 50000"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="other_income"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Income (₦)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="e.g. 20000"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="signature_url"
          render={({ field }) => (
            <FormItem>
              <FileUpload
                bucket="signatures"
                folder="guarantors"
                accept="image/*"
                label="Guarantor's Signature"
                description="Upload a clear image of the guarantor's signature"
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
            Continue to Review
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
