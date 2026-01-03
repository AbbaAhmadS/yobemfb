import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Building2, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUpload } from '@/components/loan-application/FileUpload';
import { AccountFormData, ACCOUNT_TYPE_LABELS } from '@/types/database';

const accountFormSchema = z.object({
  passport_photo_url: z.string().min(1, 'Passport photo is required'),
  account_type: z.enum(['savings', 'current', 'corporate']),
  full_name: z.string().min(3, 'Full name is required'),
  nin: z.string().length(11, 'NIN must be 11 digits'),
  bvn: z.string().length(11, 'BVN must be 11 digits'),
  phone_number: z.string().min(11, 'Valid phone number is required'),
  address: z.string().min(10, 'Complete address is required'),
  nin_document_url: z.string().min(1, 'NIN document is required'),
  signature_url: z.string().min(1, 'Signature is required'),
  referee1_name: z.string().min(3, 'Referee name is required'),
  referee1_phone: z.string().min(11, 'Valid phone number is required'),
  referee1_address: z.string().min(10, 'Complete address is required'),
  referee2_name: z.string().min(3, 'Referee name is required'),
  referee2_phone: z.string().min(11, 'Valid phone number is required'),
  referee2_address: z.string().min(10, 'Complete address is required'),
});

export default function OpenAccount() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [applicationId, setApplicationId] = useState<string>('');

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      passport_photo_url: '',
      account_type: 'savings',
      full_name: '',
      nin: '',
      bvn: '',
      phone_number: '',
      address: '',
      nin_document_url: '',
      signature_url: '',
      referee1_name: '',
      referee1_phone: '',
      referee1_address: '',
      referee2_name: '',
      referee2_phone: '',
      referee2_address: '',
    },
  });

  const handleSubmit = async (data: AccountFormData) => {
    if (!user) {
      toast.error('You must be logged in to submit an application');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate application ID
      const { data: appIdData, error: appIdError } = await supabase
        .rpc('generate_application_id', { prefix: 'AC' });

      if (appIdError) throw appIdError;

      const newApplicationId = appIdData;

      // Create account application
      const { error: accountError } = await supabase
        .from('account_applications')
        .insert({
          application_id: newApplicationId,
          user_id: user.id,
          ...data,
          status: 'pending',
        });

      if (accountError) throw accountError;

      setApplicationId(newApplicationId);
      setIsComplete(true);
      toast.success('Account application submitted successfully!');
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
              Your account application has been successfully submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Application ID</p>
              <p className="text-xl font-mono font-bold text-primary">{applicationId}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Your application is now under review. You will be notified once your account has been opened.
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Open Bank Account</h1>
          <p className="text-muted-foreground">Apply for a Yobe Microfinance Bank account</p>
        </div>
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display">Account Opening Form</CardTitle>
              <CardDescription>Complete all fields to open your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              {/* Passport Photo & Account Type */}
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="passport_photo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FileUpload
                        bucket="passport-photos"
                        folder="account-applications"
                        accept="image/*"
                        label="Passport Photograph"
                        description="Upload a recent passport photograph"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(ACCOUNT_TYPE_LABELS).map(([key, label]) => (
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
              </div>

              {/* Personal Information */}
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Personal Information</h3>
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

                  <FormField
                    control={form.control}
                    name="nin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIN</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 11-digit NIN" maxLength={11} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residential Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter your complete address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Documents */}
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Documents</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nin_document_url"
                    render={({ field }) => (
                      <FormItem>
                        <FileUpload
                          bucket="documents"
                          folder="account-nin"
                          accept="image/*,.pdf"
                          label="NIN Slip / National ID"
                          description="Upload your NIN document"
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
                          folder="account-applications"
                          accept="image/*"
                          label="Signature"
                          description="Upload your signature"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Referee 1 */}
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Referee 1</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="referee1_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Referee's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referee1_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Referee's phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="referee1_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Referee's complete address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Referee 2 */}
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Referee 2</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="referee2_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Referee's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referee2_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Referee's phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="referee2_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Referee's complete address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
