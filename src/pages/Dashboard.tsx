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
  User,
  LogOut,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoanApplication, getSolarProductName } from '@/types/database';
import { useApplicationEligibility } from '@/hooks/useApplicationEligibility';
import { downloadApplicationPDF } from '@/utils/pdfGenerator';
import { SignedImage } from '@/components/ui/signed-image';
import { toast } from 'sonner';
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
  const { eligibility, isLoading: eligibilityLoading } = useApplicationEligibility();
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEligibilityDialog, setShowEligibilityDialog] = useState(false);
  const [selectedAppForView, setSelectedAppForView] = useState<LoanApplication | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setLoanApplications(data as LoanApplication[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyForLoan = () => {
    // Check eligibility first
    if (!eligibility.canApply) {
      setShowEligibilityDialog(true);
      return;
    }
    // Navigate directly to loan application form
    navigate('/apply-loan');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDownloadPDF = async (app: LoanApplication) => {
    setIsDownloading(app.id);
    try {
      await downloadApplicationPDF(app.id);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(null);
    }
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

  // Get passport photo from most recent application for avatar
  const userPassportPhoto = loanApplications[0]?.passport_photo_url;

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
            <div className="flex items-center gap-3">
              {/* User Avatar (from passport photo) */}
              {userPassportPhoto ? (
                <SignedImage 
                  storedPath={userPassportPhoto} 
                  bucket="loan-uploads"
                  alt="Profile" 
                  className="h-10 w-10 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div>
                <h1 className="font-display font-semibold text-lg">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {profile?.full_name || 'User'}</p>
              </div>
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
        {/* Eligibility Notice */}
        {!eligibilityLoading && !eligibility.canApply && (
          <div className="mb-6 p-4 rounded-lg border border-warning bg-warning/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium text-warning-foreground">Cannot Apply for New Loan</p>
                <p className="text-sm text-muted-foreground">{eligibility.reason}</p>
                {eligibility.nextEligibleDate && (
                  <p className="text-sm mt-1 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Eligible after: {formatDate(eligibility.nextEligibleDate.toISOString())}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <Card 
            className={`card-elevated group transition-all max-w-2xl ${eligibility.canApply ? 'hover:border-primary/50 cursor-pointer' : 'opacity-60'}`} 
            onClick={handleApplyForLoan}
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-lg">Apply for Solar Loan</h3>
                <p className="text-sm text-muted-foreground">
                  {eligibility.canApply ? 'Get a complete solar system for your home' : 'Not eligible at this time'}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </div>

        {/* Solar Loan Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display">Solar Loan Applications</CardTitle>
                <CardDescription>Your solar loan application history</CardDescription>
              </div>
              <Button size="sm" onClick={handleApplyForLoan} disabled={!eligibility.canApply}>
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
                <p className="text-muted-foreground">No solar loan applications yet</p>
                <Button className="mt-4" onClick={handleApplyForLoan} disabled={!eligibility.canApply}>
                  Apply for Your First Solar Loan
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {loanApplications.slice(0, 10).map((app) => (
                  <div 
                    key={app.id} 
                    className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {app.passport_photo_url ? (
                          <SignedImage 
                            storedPath={app.passport_photo_url} 
                            bucket="loan-uploads"
                            alt="Passport" 
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{app.application_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {getSolarProductName(app.product_type)} • {formatDate(app.created_at)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedAppForView(app)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadPDF(app)}
                        disabled={isDownloading === app.id}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {isDownloading === app.id ? 'Downloading...' : 'Download PDF'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Eligibility Dialog */}
      <Dialog open={showEligibilityDialog} onOpenChange={setShowEligibilityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Cannot Apply for New Loan
            </DialogTitle>
            <DialogDescription>
              {eligibility.reason}
            </DialogDescription>
          </DialogHeader>
          {eligibility.nextEligibleDate && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>You can apply again after <strong>{formatDate(eligibility.nextEligibleDate.toISOString())}</strong></span>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowEligibilityDialog(false)}>
              I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Detail Dialog */}
      {selectedAppForView && (
        <Dialog open={!!selectedAppForView} onOpenChange={() => setSelectedAppForView(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">Application Details</DialogTitle>
              <DialogDescription>
                {selectedAppForView.application_id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{selectedAppForView.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Product</p>
                <p className="font-medium">{getSolarProductName(selectedAppForView.product_type)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">{formatAmount(selectedAppForView.specific_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Repayment Period</p>
                <p className="font-medium">{selectedAppForView.repayment_period_months} months</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {getStatusBadge(selectedAppForView.status)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Applied On</p>
                <p className="font-medium">{formatDate(selectedAppForView.created_at)}</p>
              </div>
              {selectedAppForView.bank_account_number && (
                <div>
                  <p className="text-sm text-muted-foreground">Bank Account</p>
                  <p className="font-medium">{selectedAppForView.bank_account_number}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAppForView(null)}>
                Close
              </Button>
              <Button onClick={() => handleDownloadPDF(selectedAppForView)}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}