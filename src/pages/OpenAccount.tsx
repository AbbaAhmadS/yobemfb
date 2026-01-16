import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Building2, CheckCircle, Loader2, Download, AlertTriangle } from 'lucide-react';
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
import { generateAccountApplicationPdf } from '@/utils/accountPdfGenerator';

// Nigerian States
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

// Removed account_type from schema - defaulting to 'current'
const accountFormSchema = z.object({
  passport_photo_url: z.string().min(1, 'Passport photo is required'),
  full_name: z.string().min(3, 'Full name is required'),
  phone_number: z.string().min(11, 'Valid phone number is required'),
  state: z.string().min(1, 'State is required'),
  local_government: z.string().min(2, 'Local government is required'),
  address: z.string().min(10, 'Complete address is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  bvn: z.string().length(11, 'BVN must be 11 digits'),
  nin: z.string().length(11, 'NIN must be 11 digits'),
  nin_document_url: z.string().min(1, 'NIN document is required'),
  next_of_kin_name: z.string().min(3, 'Next of kin name is required'),
  next_of_kin_address: z.string().min(10, 'Next of kin address is required'),
  next_of_kin_phone: z.string().min(11, 'Valid phone number is required'),
  signature_url: z.string().min(1, 'Signature is required'),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function OpenAccount() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [applicationId, setApplicationId] = useState<string>('');
  const [submittedData, setSubmittedData] = useState<AccountFormValues | null>(null);
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [existingApplicationId, setExistingApplicationId] = useState<string | null>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      passport_photo_url: '',
      full_name: '',
      phone_number: '',
      state: '',
      local_government: '',
      address: '',
      date_of_birth: '',
      bvn: '',
      nin: '',
      nin_document_url: '',
      next_of_kin_name: '',
      next_of_kin_address: '',
      next_of_kin_phone: '',
      signature_url: '',
    },
  });

  // Check for existing application
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user) {
        setIsCheckingExisting(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('account_applications')
          .select('id, application_id')
          .eq('user_id', user.id)
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setHasExistingApplication(true);
          setExistingApplicationId(data[0].application_id);
        }
      } catch (error) {
        console.error('Error checking existing application:', error);
      } finally {
        setIsCheckingExisting(false);
      }
    };

    checkExistingApplication();
  }, [user]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (hasExistingApplication) return;
    
    const savedDraft = localStorage.getItem('account_application_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        form.reset(parsed);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, [hasExistingApplication]);

  useEffect(() => {
    if (hasExistingApplication) return;
    
    const subscription = form.watch((values) => {
      localStorage.setItem('account_application_draft', JSON.stringify(values));
    });
    return () => subscription.unsubscribe();
  }, [form.watch, hasExistingApplication]);

  const handleSubmit = async (data: AccountFormValues) => {
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

      // Create account application with account_type defaulting to 'current'
      const { error: accountError } = await supabase
        .from('account_applications')
        .insert({
          application_id: newApplicationId,
          user_id: user.id,
          passport_photo_url: data.passport_photo_url,
          full_name: data.full_name,
          phone_number: data.phone_number,
          address: data.address,
          bvn: data.bvn,
          nin: data.nin,
          nin_document_url: data.nin_document_url,
          signature_url: data.signature_url,
          account_type: 'current', // Default to current account
          // New fields
          state: data.state,
          local_government: data.local_government,
          date_of_birth: data.date_of_birth,
          next_of_kin_name: data.next_of_kin_name,
          next_of_kin_address: data.next_of_kin_address,
          next_of_kin_phone: data.next_of_kin_phone,
          // Legacy fields - use next of kin data for compatibility
          referee1_name: data.next_of_kin_name,
          referee1_phone: data.next_of_kin_phone,
          referee1_address: data.next_of_kin_address,
          status: 'pending',
        } as any);

      if (accountError) throw accountError;

      setApplicationId(newApplicationId);
      setSubmittedData(data);
      setIsComplete(true);
      localStorage.removeItem('account_application_draft');
      toast.success('Account application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!submittedData) return;
    generateAccountApplicationPdf({
      applicationId,
      passport_photo_url: submittedData.passport_photo_url,
      full_name: submittedData.full_name,
      phone_number: submittedData.phone_number,
      state: submittedData.state,
      local_government: submittedData.local_government,
      address: submittedData.address,
      date_of_birth: submittedData.date_of_birth,
      bvn: submittedData.bvn,
      nin: submittedData.nin,
      next_of_kin_name: submittedData.next_of_kin_name,
      next_of_kin_address: submittedData.next_of_kin_address,
      next_of_kin_phone: submittedData.next_of_kin_phone,
      account_type: 'current',
      status: 'pending',
    });
  };

  if (isCheckingExisting) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="card-elevated text-center">
          <CardContent className="py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Checking application status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if user already has an application
  if (hasExistingApplication) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="card-elevated text-center">
          <CardHeader>
            <div className="mx-auto h-20 w-20 rounded-full bg-warning/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-10 w-10 text-warning" />
            </div>
            <CardTitle className="font-display text-2xl">Application Already Submitted</CardTitle>
            <CardDescription className="text-base">
              You have already submitted an account opening application with Yobe Microfinance Bank.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Your Application ID</p>
              <p className="text-xl font-mono font-bold text-primary">{existingApplicationId}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              You can only submit one account opening application. Please check your dashboard for the status of your existing application.
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
              <Button onClick={handleDownloadPdf}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
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
          <p className="text-muted-foreground">Apply for a Yobe Microfinance Bank Current Account</p>
        </div>
      </div>

      <Card className="card-elevated">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display">Current Account Opening Form</CardTitle>
              <CardDescription>Complete all fields to open your current account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              {/* Step 1: Passport Photo */}
              <div className="border-b pb-6">
                <h3 className="font-medium mb-4 text-lg">1. Passport Photograph</h3>
                <FormField
                  control={form.control}
                  name="passport_photo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FileUpload
                        bucket="passport-photos"
                        folder="account-applications"
                        accept="image/jpeg,image/jpg,image/png"
                        label="Passport Photograph *"
                        description="Upload a recent passport photograph (JPG, PNG - max 200KB)"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Step 2-7: Personal Information - Removed Account Type */}
              <div className="border-b pb-6">
                <h3 className="font-medium mb-4 text-lg">2-7. Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
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
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="08012345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {NIGERIAN_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
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
                    name="local_government"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local Government *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter local government" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>Residential Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter your complete address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Step 8-10: Identification */}
              <div className="border-b pb-6">
                <h3 className="font-medium mb-4 text-lg">8-10. Identification</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="bvn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>BVN *</FormLabel>
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
                        <FormLabel>National Identification NIN *</FormLabel>
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
                    name="nin_document_url"
                    render={({ field }) => (
                      <FormItem>
                        <FileUpload
                          bucket="documents"
                          folder="account-nin"
                          accept="image/jpeg,image/jpg,image/png"
                          label="NIN Slip / National ID Upload *"
                          description="Upload your NIN document (JPG, PNG - max 200KB)"
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Step 11-13: Next of Kin */}
              <div className="border-b pb-6">
                <h3 className="font-medium mb-4 text-lg">11-13. Next of Kin Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="next_of_kin_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next of Kin Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter next of kin name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="next_of_kin_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next of Kin Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="08012345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-6">
                  <FormField
                    control={form.control}
                    name="next_of_kin_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next of Kin Address *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter next of kin address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Step 14: Signature */}
              <div className="border-b pb-6">
                <h3 className="font-medium mb-4 text-lg">14. Signature</h3>
                <FormField
                  control={form.control}
                  name="signature_url"
                  render={({ field }) => (
                    <FormItem>
                      <FileUpload
                        bucket="signatures"
                        folder="account-signatures"
                        accept="image/jpeg,image/jpg,image/png"
                        label="Upload Your Signature *"
                        description="Sign on white paper and upload (JPG, PNG - max 200KB)"
                        value={field.value}
                        onChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
