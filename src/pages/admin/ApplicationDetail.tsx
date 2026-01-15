import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  CreditCard, 
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Brain,
  Loader2,
  Building2,
  Eye,
  Lock,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  LoanApplication, 
  Guarantor, 
  ApplicationStatus, 
  AppRole,
  STATUS_LABELS,
  LOAN_AMOUNT_LABELS
} from '@/types/database';
import { toast } from 'sonner';
import { SignedImage } from '@/components/ui/signed-image';
import { SignedDocumentLink } from '@/components/ui/signed-document-link';

const statusConfig: Record<ApplicationStatus, { className: string; icon: React.ElementType }> = {
  pending: { className: 'status-pending', icon: Clock },
  under_review: { className: 'status-under_review', icon: AlertTriangle },
  approved: { className: 'status-approved', icon: CheckCircle },
  declined: { className: 'status-declined', icon: XCircle },
  flagged: { className: 'status-flagged', icon: AlertTriangle },
};

const ACCOUNT_TYPE_MAP: Record<string, string> = {
  savings: 'Savings Account',
  current: 'Current Account',
  corporate: 'Corporate Account',
};

export default function ApplicationDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [guarantor, setGuarantor] = useState<Guarantor | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineNotes, setDeclineNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ path: string; label: string } | null>(null);

  // Check if user can view uploaded documents (only Credit Department)
  const canViewDocuments = userRole === 'credit';

  useEffect(() => {
    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .single();

      if (roleData) {
        setUserRole(roleData.role as AppRole);
      }

      // Fetch application
      const { data: appData, error: appError } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('id', id)
        .single();

      if (appError) throw appError;
      setApplication(appData as LoanApplication);

      // Fetch guarantor
      const { data: guarantorData } = await supabase
        .from('guarantors')
        .select('*')
        .eq('loan_application_id', id)
        .single();

      if (guarantorData) {
        setGuarantor(guarantorData as Guarantor);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load application');
      navigate('/admin/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!application) return;
    
    setIsDownloadingPdf(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-pdf', {
        body: { applicationId: application.id }
      });

      if (error) throw error;

      // The response is HTML, create a proper PDF download
      const blob = new Blob([data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new window for printing as PDF
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      toast.success('PDF opened - use Print to save as PDF');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleAnalyze = async () => {
    if (!application) return;
    
    setIsAnalyzing(true);
    setShowAnalysisDialog(true);
    setAnalysisResult('');
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-application', {
        body: { applicationId: application.id }
      });

      if (error) {
        console.error('Analysis error response:', error);
        throw error;
      }
      
      setAnalysisResult(data.analysis || 'No analysis generated');
    } catch (error: any) {
      console.error('Analysis error:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      toast.error(`Failed to analyze application: ${errorMessage}`);
      setAnalysisResult(`Failed to generate analysis: ${errorMessage}. Please try again.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    if (!application || !userRole || !user) return;

    setIsUpdating(true);
    try {
      const updateData: Record<string, unknown> = {};
      let newStatus: ApplicationStatus = 'under_review';

      switch (userRole) {
        case 'credit':
          updateData.credit_approval = true;
          updateData.credit_approved_by = user.id;
          updateData.credit_approved_at = new Date().toISOString();
          break;
        case 'audit':
          updateData.audit_approval = true;
          updateData.audit_approved_by = user.id;
          updateData.audit_approved_at = new Date().toISOString();
          break;
        case 'coo':
          updateData.coo_approval = true;
          updateData.coo_approved_by = user.id;
          updateData.coo_approved_at = new Date().toISOString();
          newStatus = 'approved';
          break;
      }

      updateData.status = newStatus;

      const { error } = await supabase
        .from('loan_applications')
        .update(updateData)
        .eq('id', application.id);

      if (error) throw error;

      // Log action
      await supabase.from('admin_actions').insert({
        admin_user_id: user.id,
        action_type: 'approve',
        target_table: 'loan_applications',
        target_id: application.id,
        previous_status: application.status,
        new_status: newStatus,
      });

      toast.success('Application approved successfully');
      fetchData();
    } catch (error) {
      console.error('Error approving:', error);
      toast.error('Failed to approve application');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecline = async () => {
    if (!application || !user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({
          status: 'declined',
          notes: declineNotes,
        })
        .eq('id', application.id);

      if (error) throw error;

      // Log action
      await supabase.from('admin_actions').insert({
        admin_user_id: user.id,
        action_type: 'decline',
        target_table: 'loan_applications',
        target_id: application.id,
        previous_status: application.status,
        new_status: 'declined',
        notes: declineNotes,
      });

      toast.success('Application declined');
      setShowDeclineDialog(false);
      fetchData();
    } catch (error) {
      console.error('Error declining:', error);
      toast.error('Failed to decline application');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const canApprove = (): boolean => {
    if (!application || !userRole) return false;

    switch (userRole) {
      case 'credit':
        return !application.credit_approval && application.status !== 'approved' && application.status !== 'declined';
      case 'audit':
        return application.credit_approval === true && !application.audit_approval && application.status !== 'approved' && application.status !== 'declined';
      case 'coo':
        return application.audit_approval === true && !application.coo_approval && application.status !== 'approved' && application.status !== 'declined';
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const StatusIcon = statusConfig[application.status].icon;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display font-semibold text-lg">
                Application {application.application_id}
              </h1>
              <Badge variant="outline" className={statusConfig[application.status].className}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {STATUS_LABELS[application.status]}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloadingPdf}>
              {isDownloadingPdf ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              AI Analysis
            </Button>
            {canApprove() && (
              <>
                <Button variant="outline" onClick={() => setShowDeclineDialog(true)} disabled={isUpdating}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
                <Button onClick={handleApprove} disabled={isUpdating}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Application Type & Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Application Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Application Type:</span>
                  <p className="font-medium">
                    <Badge variant={application.application_type === 'internal' ? 'default' : 'secondary'}>
                      {application.application_type.toUpperCase()}
                    </Badge>
                    {application.application_type === 'internal' && (
                      <span className="ml-2 text-xs text-muted-foreground">(Salary with YobeMFB)</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created By:</span>
                  <p className="font-medium">
                    {application.created_by_admin ? (
                      <Badge variant="outline" className="bg-primary/10">
                        Credit Dept (On Behalf)
                      </Badge>
                    ) : (
                      <span>Applicant</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Applicant Info with Passport Photo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-primary" />
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-4">
                  {canViewDocuments && application.passport_photo_url ? (
                    <SignedImage
                      storedPath={application.passport_photo_url}
                      bucket="passport-photos"
                      alt="Passport"
                      className="h-28 w-28 rounded-lg object-cover border-2 border-primary shadow-md"
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-lg bg-muted flex items-center justify-center">
                      {canViewDocuments ? (
                        <User className="h-10 w-10 text-muted-foreground" />
                      ) : (
                        <Lock className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-lg">{application.full_name}</p>
                    <p className="text-sm text-muted-foreground">{application.phone_number}</p>
                    <p className="text-sm text-muted-foreground">{application.ministry_department}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Employee ID:</span>
                    <span className="ml-2 font-medium">{application.employee_id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">BVN:</span>
                    <span className="ml-2 font-medium">{application.bvn}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">NIN:</span>
                    <span className="ml-2 font-medium">{application.nin}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium">{application.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Loan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Product Type:</span>
                  <p className="font-medium capitalize">{application.product_type.replace('_', ' ')} Loan</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount Range:</span>
                  <p className="font-medium">{LOAN_AMOUNT_LABELS[application.loan_amount_range]}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Requested Amount:</span>
                  <p className="font-medium text-lg text-primary">{formatAmount(application.specific_amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Repayment Period:</span>
                  <p className="font-medium">{application.repayment_period_months} Months</p>
                </div>
                <div>
                  <span className="text-muted-foreground">YobeMFB Account Type:</span>
                  <p className="font-medium">{ACCOUNT_TYPE_MAP[application.bank_name] || application.bank_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">YobeMFB Account Number:</span>
                  <p className="font-medium">{application.bank_account_number}</p>
                </div>
              </CardContent>
            </Card>

            {/* Guarantor */}
            {guarantor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-primary" />
                    Guarantor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Full Name:</span>
                    <p className="font-medium">{guarantor.full_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{guarantor.phone_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Organization:</span>
                    <p className="font-medium">{guarantor.organization}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Position:</span>
                    <p className="font-medium">{guarantor.position}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Employee ID:</span>
                    <p className="font-medium">{guarantor.employee_id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Monthly Salary:</span>
                    <p className="font-medium">{formatAmount(guarantor.salary)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Allowances:</span>
                    <p className="font-medium">{formatAmount(guarantor.allowances || 0)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Other Income:</span>
                    <p className="font-medium">{formatAmount(guarantor.other_income || 0)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">BVN:</span>
                    <p className="font-medium">{guarantor.bvn}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium">{guarantor.address}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Documents - Viewable by Credit ONLY */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Uploaded Documents
                  {!canViewDocuments && (
                    <Badge variant="outline" className="ml-auto">
                      <Lock className="h-3 w-3 mr-1" />
                      Restricted
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canViewDocuments ? (
                  <>
                    <div className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer" onClick={() => {
                      setSelectedDocument({ path: application.passport_photo_url, label: 'Passport Photo' });
                      setShowDocumentDialog(true);
                    }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Passport Photo</span>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <SignedDocumentLink
                      storedPath={application.nin_document_url}
                      bucket="documents"
                      label="NIN Document"
                    />
                    <SignedDocumentLink
                      storedPath={application.payment_slip_url}
                      bucket="documents"
                      label="Payment Slip"
                    />
                    <SignedDocumentLink
                      storedPath={application.signature_url}
                      bucket="signatures"
                      label="Signature"
                    />
                    {guarantor && (
                      <SignedDocumentLink
                        storedPath={guarantor.signature_url}
                        bucket="signatures"
                        label="Guarantor Signature"
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Document access restricted</p>
                    <p className="text-xs">Only Credit Department can view uploaded documents</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approval Chain */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Approval Chain</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    application.credit_approval ? 'bg-success text-success-foreground' : 'bg-muted'
                  }`}>
                    {application.credit_approval ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">Credit Department</p>
                    <p className="text-xs text-muted-foreground">
                      {application.credit_approval ? 'Approved' : 'Pending'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    application.audit_approval ? 'bg-success text-success-foreground' : 'bg-muted'
                  }`}>
                    {application.audit_approval ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">Internal Audit</p>
                    <p className="text-xs text-muted-foreground">
                      {application.audit_approval ? 'Approved' : 'Pending'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    application.coo_approval ? 'bg-success text-success-foreground' : 'bg-muted'
                  }`}>
                    {application.coo_approval ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">COO</p>
                    <p className="text-xs text-muted-foreground">
                      {application.coo_approval ? 'Approved' : 'Pending'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">Submitted:</span>
                    <p className="font-medium">{formatDate(application.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>
                    <p className="font-medium">{formatDate(application.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this application.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter reason for declining..."
            value={declineNotes}
            onChange={(e) => setDeclineNotes(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDecline} disabled={isUpdating || !declineNotes.trim()}>
              Decline Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Risk Analysis
            </DialogTitle>
            <DialogDescription>
              AI-powered analysis of loan application {application?.application_id}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Analyzing application...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                {analysisResult}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnalysisDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.label}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedDocument && (
              <SignedImage
                storedPath={selectedDocument.path}
                bucket="passport-photos"
                alt={selectedDocument.label}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocumentDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}