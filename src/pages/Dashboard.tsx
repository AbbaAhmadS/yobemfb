import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  ArrowRight,
  Building2,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoanApplication, AccountApplication } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'declined' | 'flagged';

const statusConfig: Record<ApplicationStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Pending', icon: Clock, className: 'status-pending' },
  under_review: { label: 'Under Review', icon: AlertTriangle, className: 'status-under_review' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'status-approved' },
  declined: { label: 'Declined', icon: XCircle, className: 'status-declined' },
  flagged: { label: 'Flagged', icon: AlertTriangle, className: 'status-flagged' },
};

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [accountApplications, setAccountApplications] = useState<AccountApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBankAccountDialog, setShowBankAccountDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const [loanRes, accountRes] = await Promise.all([
        supabase
          .from('loan_applications')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('account_applications')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
      ]);

      if (loanRes.data) setLoanApplications(loanRes.data as LoanApplication[]);
      if (accountRes.data) setAccountApplications(accountRes.data as AccountApplication[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyForLoan = () => {
    if (!profile?.has_bank_account && accountApplications.length === 0) {
      setShowBankAccountDialog(true);
    } else {
      navigate('/apply/loan');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: ApplicationStatus | null) => {
    const config = statusConfig[status || 'pending'];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">Y</span>
              </div>
            </Link>
            <div>
              <h1 className="font-display font-semibold text-lg">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || 'User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="card-elevated group hover:border-primary/50 cursor-pointer transition-all" onClick={handleApplyForLoan}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg">Apply for Loan</h3>
                <p className="text-sm text-muted-foreground">Start a new loan application</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>

          <Card 
            className="card-elevated group hover:border-primary/50 cursor-pointer transition-all" 
            onClick={() => navigate('/apply/account')}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-secondary/20 flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                <Building2 className="h-7 w-7 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg">Open Bank Account</h3>
                <p className="text-sm text-muted-foreground">Apply for a new bank account</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </div>

        {/* Applications Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Loan Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display">Loan Applications</CardTitle>
                  <CardDescription>Your loan application history</CardDescription>
                </div>
                <Button size="sm" onClick={handleApplyForLoan}>
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : loanApplications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No loan applications yet</p>
                  <Button className="mt-4" onClick={handleApplyForLoan}>
                    Apply for Your First Loan
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {loanApplications.slice(0, 5).map((app) => (
                    <div 
                      key={app.id} 
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/applications/loan/${app.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{app.application_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatAmount(app.specific_amount)} • {formatDate(app.created_at)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display">Account Applications</CardTitle>
                  <CardDescription>Your bank account applications</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/apply/account')}>
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : accountApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No account applications yet</p>
                  <Button className="mt-4" variant="outline" onClick={() => navigate('/apply/account')}>
                    Open a Bank Account
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {accountApplications.slice(0, 5).map((app) => (
                    <div 
                      key={app.id} 
                      className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/applications/account/${app.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{app.application_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.account_type} • {formatDate(app.created_at)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bank Account Dialog */}
      <Dialog open={showBankAccountDialog} onOpenChange={setShowBankAccountDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Do you have a YobeMFB account?</DialogTitle>
            <DialogDescription>
              To apply for a loan, you need a Yobe Microfinance Bank account. If you don't have one, 
              you can open an account first or proceed with your loan application.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => {
              setShowBankAccountDialog(false);
              navigate('/apply/account');
            }}>
              Open Account First
            </Button>
            <Button onClick={() => {
              setShowBankAccountDialog(false);
              navigate('/apply/loan');
            }}>
              I Have an Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
