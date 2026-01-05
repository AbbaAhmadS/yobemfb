import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const verifySchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().regex(/^[0-9]{11}$/, 'Please enter a valid 11-digit phone number'),
});

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ForgotPassword() {
  const [step, setStep] = useState<'verify' | 'reset' | 'success'>('verify');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [verifyData, setVerifyData] = useState({
    email: '',
    phoneNumber: '',
  });
  
  const [resetData, setResetData] = useState({
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleVerifyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVerifyData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const result = verifySchema.safeParse(verifyData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      // Check if email and phone match in profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email, phone_number')
        .eq('email', verifyData.email)
        .eq('phone_number', verifyData.phoneNumber)
        .maybeSingle();

      if (error) throw error;

      if (!profile) {
        toast({
          title: 'Verification Failed',
          description: 'The email and phone number combination does not match our records.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      setVerifiedEmail(verifyData.email);
      setStep('reset');
      toast({
        title: 'Verified!',
        description: 'Please create your new password.',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const result = resetSchema.safeParse(resetData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      // Use Supabase to update the password via a magic link/reset flow
      // Since we verified the user, we'll use the admin API pattern via edge function
      const { error } = await supabase.functions.invoke('reset-password', {
        body: { email: verifiedEmail, newPassword: resetData.password },
      });

      if (error) throw error;

      setStep('success');
      toast({
        title: 'Password Updated!',
        description: 'Your password has been successfully changed.',
      });
    } catch (err) {
      // Fallback: If edge function doesn't exist, send a password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(verifiedEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to reset password. Please try again or contact support.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Reset Email Sent',
          description: 'Please check your email for a password reset link.',
        });
        navigate('/auth');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 -z-10" />
        
        <Card className="w-full max-w-md border-0 shadow-lg animate-scale-in">
          <CardContent className="pt-8 pb-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">Password Updated!</h2>
            <p className="text-muted-foreground mb-6">
              Your password has been successfully changed. You can now log in with your new password.
            </p>
            <Button className="w-full" onClick={() => navigate('/auth')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 -z-10" />
      
      <div className="w-full max-w-md animate-scale-in">
        <Link to="/auth" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-14 w-14 rounded-xl bg-primary flex items-center justify-center mb-4">
              <span className="text-primary-foreground font-display font-bold text-2xl">Y</span>
            </div>
            <CardTitle className="font-display text-2xl">
              {step === 'verify' ? 'Reset Password' : 'Create New Password'}
            </CardTitle>
            <CardDescription>
              {step === 'verify' 
                ? 'Enter your registered email and phone number to verify your identity'
                : 'Enter your new password below'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'verify' ? (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={verifyData.email}
                      onChange={handleVerifyChange}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Registered Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="08012345678"
                      value={verifyData.phoneNumber}
                      onChange={handleVerifyChange}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Identity'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="p-3 rounded-lg bg-muted/50 mb-4">
                  <p className="text-sm text-muted-foreground">
                    Creating new password for: <strong>{verifiedEmail}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={resetData.password}
                      onChange={handleResetChange}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={resetData.confirmPassword}
                      onChange={handleResetChange}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}