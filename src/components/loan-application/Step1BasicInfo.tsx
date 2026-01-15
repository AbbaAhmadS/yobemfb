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
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUpload } from './FileUpload';
import { LoanStep1Data } from '@/types/database';
import { ArrowRight, User } from 'lucide-react';
import { SignedImage } from '@/components/ui/signed-image';

const step1Schema = z.object({
  full_name: z.string().min(3, 'Full name is required'),
  phone_number: z.string().min(11, 'Valid phone number is required'),
  address: z.string().min(10, 'Complete address is required'),
  ministry_department: z.string().min(2, 'Ministry/Department is required'),
  employee_id: z.string().min(1, 'Employee ID is required'),
  passport_photo_url: z.string().min(1, 'Passport photo is required'),
  application_type: z.enum(['internal', 'external']),
});

interface Step1Props {
  initialData: Partial<LoanStep1Data>;
  onSubmit: (data: LoanStep1Data) => void;
}

export function Step1BasicInfo({ initialData, onSubmit }: Step1Props) {
  const form = useForm<LoanStep1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      full_name: initialData.full_name || '',
      phone_number: initialData.phone_number || '',
      address: initialData.address || '',
      ministry_department: initialData.ministry_department || '',
      employee_id: initialData.employee_id || '',
      passport_photo_url: initialData.passport_photo_url || '',
      application_type: initialData.application_type || 'external',
    },
  });

  const passportPhotoUrl = form.watch('passport_photo_url');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Passport Photo First - Prominent Display */}
        <div className="p-6 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
          <div className="flex items-start gap-6">
            {/* Avatar Preview */}
            <div className="flex-shrink-0">
              {passportPhotoUrl ? (
                <SignedImage 
                  storedPath={passportPhotoUrl} 
                  bucket="passport-photos"
                  alt="Your passport photo" 
                  className="h-32 w-32 rounded-xl object-cover border-4 border-primary shadow-lg"
                />
              ) : (
                <div className="h-32 w-32 rounded-xl bg-muted flex items-center justify-center border-4 border-dashed border-muted-foreground/30">
                  <User className="h-12 w-12 text-muted-foreground/50" />
                </div>
              )}
            </div>
            
            {/* Upload Field */}
            <div className="flex-1">
              <FormField
                control={form.control}
                name="passport_photo_url"
                render={({ field }) => (
                  <FormItem>
                    <FileUpload
                      bucket="passport-photos"
                      folder="loan-applications"
                      accept="image/jpeg,image/jpg,image/png"
                      label="Passport Photograph *"
                      description="Upload a recent passport photograph (JPG, PNG - max 500KB). This will serve as your avatar."
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
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
                <Textarea 
                  placeholder="Enter your complete residential address" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="ministry_department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ministry/Department/Agency</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your MDA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employee_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee ID / Staff Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your staff ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="application_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Application Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select application type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="internal">Internal (Salary Account with YobeMFB)</SelectItem>
                  <SelectItem value="external">External (Salary Account with other bank)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select 'Internal' if your salary is paid into a YobeMFB account
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
