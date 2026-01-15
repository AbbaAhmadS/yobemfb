import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Eye,
  FileText,
  AlertTriangle,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { SignedImage } from '@/components/ui/signed-image';
import { SignedDocumentLink } from '@/components/ui/signed-document-link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface AccountApplication {
  id: string;
  user_id: string;
  application_id: string;
  full_name: string;
  phone_number: string;
  address: string;
  bvn: string;
  nin: string;
  account_type: 'savings' | 'current' | 'corporate';
  status: 'pending' | 'under_review' | 'approved' | 'declined' | 'flagged' | null;
  created_at: string;
  updated_at: string;
  passport_photo_url: string;
  nin_document_url: string;
  signature_url: string;
  referee1_name: string;
  referee1_phone: string;
  referee1_address: string;
  referee2_name: string;
  referee2_phone: string;
  referee2_address: string;
  notes: string | null;
  decline_reason?: string | null;
  // New fields
  state?: string;
  local_government?: string;
  date_of_birth?: string;
  next_of_kin_name?: string;
  next_of_kin_address?: string;
  next_of_kin_phone?: string;
}

interface OperationsAnalyticsData {
  accountApplications: AccountApplication[];
  accountStats: {
    total: number;
    pending: number;
    approved: number;
    declined: number;
    underReview: number;
  };
  trends: {
    accountsThisMonth: number;
    accountsLastMonth: number;
    approvedThisMonth: number;
    declinedThisMonth: number;
  };
}

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-warning/10 text-warning' },
  under_review: { label: 'Under Review', icon: AlertTriangle, className: 'bg-primary/10 text-primary' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-success/10 text-success' },
  declined: { label: 'Declined', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
  flagged: { label: 'Flagged', icon: AlertTriangle, className: 'bg-orange-500/10 text-orange-500' },
};

export default function OperationsAnalyticsDashboard() {
  const navigate = useNavigate();
  const { isAdmin, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<OperationsAnalyticsData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<AccountApplication | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchAnalytics();
  }, [isAdmin, navigate]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch account applications using the RPC function for Account Opening Department
      const { data: accountData, error: accountError } = await supabase
        .rpc('get_account_applications_for_operations');

      if (accountError) {
        console.error('RPC error, falling back to direct query:', accountError);
        // Fallback to direct query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('account_applications')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        processAccountData(fallbackData || [], startOfMonth, startOfLastMonth, endOfLastMonth);
      } else {
        processAccountData(accountData || [], startOfMonth, startOfLastMonth, endOfLastMonth);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const processAccountData = (
    accountData: any[], 
    startOfMonth: Date, 
    startOfLastMonth: Date, 
    endOfLastMonth: Date
  ) => {
    const accounts = accountData as AccountApplication[];

    // Calculate account stats - removed account type breakdown
    const accountStats = {
      total: accounts.length,
      pending: accounts.filter(a => a.status === 'pending').length,
      approved: accounts.filter(a => a.status === 'approved').length,
      declined: accounts.filter(a => a.status === 'declined').length,
      underReview: accounts.filter(a => a.status === 'under_review').length,
    };

    // Calculate trends
    const accountsThisMonth = accounts.filter(a => new Date(a.created_at) >= startOfMonth).length;
    const accountsLastMonth = accounts.filter(a => {
      const date = new Date(a.created_at);
      return date >= startOfLastMonth && date <= endOfLastMonth;
    }).length;

    const approvedThisMonth = accounts.filter(a => 
      new Date(a.created_at) >= startOfMonth && a.status === 'approved'
    ).length;

    const declinedThisMonth = accounts.filter(a => 
      new Date(a.created_at) >= startOfMonth && a.status === 'declined'
    ).length;

    setAnalytics({
      accountApplications: accounts,
      accountStats,
      trends: {
        accountsThisMonth,
        accountsLastMonth,
        approvedThisMonth,
        declinedThisMonth,
      },
    });
  };

  const handleStatusUpdate = async (appId: string, newStatus: 'pending' | 'under_review' | 'approved' | 'declined' | 'flagged', reason?: string) => {
    setIsUpdating(true);
    try {
      const updateData: Record<string, any> = { status: newStatus };
      if (newStatus === 'declined' && reason) {
        updateData.decline_reason = reason;
      }

      const { error } = await supabase
        .from('account_applications')
        .update(updateData)
        .eq('id', appId);

      if (error) throw error;

      toast.success(`Application ${newStatus === 'approved' ? 'approved' : newStatus === 'declined' ? 'declined' : 'updated'} successfully`);
      fetchAnalytics();
      setSelectedApplication(null);
      setShowDeclineDialog(false);
      setDeclineReason('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update application status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeclineClick = () => {
    setShowDeclineDialog(true);
  };

  const handleConfirmDecline = () => {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }
    if (selectedApplication) {
      handleStatusUpdate(selectedApplication.id, 'declined', declineReason);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getTrendPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-success" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter applications based on search
  const filteredApplications = analytics?.accountApplications.filter(app => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.application_id.toLowerCase().includes(query) ||
      app.full_name.toLowerCase().includes(query) ||
      app.phone_number.includes(query)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Account Opening Department Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Account opening applications management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <AdminSearchBar 
            onSearch={setSearchQuery}
            placeholder="Search by Application ID, Name, or Phone..."
          />
        </div>

        {/* Overview Stats - Updated: Removed account type breakdown, added relevant stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{analytics.accountStats.total}</p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                {getTrendIcon(analytics.trends.accountsThisMonth, analytics.trends.accountsLastMonth)}
                <span className={analytics.trends.accountsThisMonth >= analytics.trends.accountsLastMonth ? 'text-success' : 'text-destructive'}>
                  {getTrendPercentage(analytics.trends.accountsThisMonth, analytics.trends.accountsLastMonth)}%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <p className="text-3xl font-bold">{analytics.accountStats.pending}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {analytics.accountStats.underReview} under review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Approved This Month</p>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <p className="text-3xl font-bold">{analytics.trends.approvedThisMonth}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {analytics.accountStats.approved} total approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">
                {analytics.accountStats.total > 0 
                  ? ((analytics.accountStats.approved / analytics.accountStats.total) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {analytics.accountStats.declined} declined
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Applications by Status</CardTitle>
              <CardDescription>Current distribution of account applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-warning" />
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-warning rounded-full"
                        style={{ width: `${(analytics.accountStats.pending / analytics.accountStats.total) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{analytics.accountStats.pending}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Under Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(analytics.accountStats.underReview / analytics.accountStats.total) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{analytics.accountStats.underReview}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Approved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full"
                        style={{ width: `${(analytics.accountStats.approved / analytics.accountStats.total) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{analytics.accountStats.approved}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span>Declined</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-destructive rounded-full"
                        style={{ width: `${(analytics.accountStats.declined / analytics.accountStats.total) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{analytics.accountStats.declined}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Monthly Performance</CardTitle>
              <CardDescription>This month's application metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">New Applications</p>
                      <p className="text-2xl font-bold">{analytics.trends.accountsThisMonth}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Month</p>
                      <p className="text-2xl font-bold text-muted-foreground">{analytics.trends.accountsLastMonth}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-success/5">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">Approved</span>
                    </div>
                    <p className="text-2xl font-bold text-success">{analytics.trends.approvedThisMonth}</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-destructive/5">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-medium">Declined</span>
                    </div>
                    <p className="text-2xl font-bold text-destructive">{analytics.trends.declinedThisMonth}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Applications List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Account Opening Applications</CardTitle>
            <CardDescription>Click on an application to view full details and uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredApplications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery ? 'No applications match your search.' : 'No account applications found.'}
                </p>
              ) : (
                filteredApplications.map((app) => {
                  const config = statusConfig[app.status || 'pending'];
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedApplication(app)}
                    >
                      <div className="flex items-center gap-4">
                        {app.passport_photo_url ? (
                          <SignedImage 
                            storedPath={app.passport_photo_url} 
                            bucket="passport-photos"
                            alt="Passport" 
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{app.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {app.application_id} • Current Account
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(app.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={config.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Application Detail Dialog - Full Access for Account Opening Dept */}
      <Dialog open={!!selectedApplication && !showDeclineDialog} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Account Application - {selectedApplication?.application_id}
            </DialogTitle>
            <DialogDescription>
              Current Account Application
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info with Passport Photo */}
              <div className="flex items-start gap-6 p-4 rounded-lg border bg-muted/30">
                <div className="flex-shrink-0">
                  {selectedApplication.passport_photo_url ? (
                    <SignedImage 
                      storedPath={selectedApplication.passport_photo_url} 
                      bucket="passport-photos"
                      alt="Passport" 
                      className="h-32 w-32 rounded-lg object-cover border-2 border-primary shadow-md"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-lg bg-muted flex items-center justify-center">
                      <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-xs text-center text-muted-foreground mt-2">Passport Photo</p>
                </div>
                <div className="flex-1 grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-semibold text-lg">{selectedApplication.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{selectedApplication.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{selectedApplication.date_of_birth ? formatDate(selectedApplication.date_of_birth) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Account Type</p>
                    <p className="font-medium">Current Account</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">State</p>
                    <p className="font-medium">{selectedApplication.state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Local Government</p>
                    <p className="font-medium">{selectedApplication.local_government || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="p-4 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Residential Address</p>
                <p className="font-medium">{selectedApplication.address}</p>
              </div>

              {/* Identification */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">BVN</p>
                  <p className="font-mono font-medium text-lg">{selectedApplication.bvn}</p>
                </div>
                <div className="p-4 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">NIN</p>
                  <p className="font-mono font-medium text-lg">{selectedApplication.nin}</p>
                </div>
              </div>

              {/* Uploaded Documents - FULLY VISIBLE */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Uploaded Documents
                </h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xs text-muted-foreground mb-2">Passport Photo</p>
                    {selectedApplication.passport_photo_url ? (
                      <SignedImage 
                        storedPath={selectedApplication.passport_photo_url} 
                        bucket="passport-photos"
                        alt="Passport" 
                        className="w-full h-32 rounded object-cover"
                      />
                    ) : (
                      <div className="h-32 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Not uploaded</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xs text-muted-foreground mb-2">NIN Document</p>
                    {selectedApplication.nin_document_url ? (
                      <SignedImage 
                        storedPath={selectedApplication.nin_document_url} 
                        bucket="documents"
                        alt="NIN Document" 
                        className="w-full h-32 rounded object-cover"
                      />
                    ) : (
                      <div className="h-32 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Not uploaded</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xs text-muted-foreground mb-2">Signature</p>
                    {selectedApplication.signature_url ? (
                      <SignedImage 
                        storedPath={selectedApplication.signature_url} 
                        bucket="signatures"
                        alt="Signature" 
                        className="w-full h-32 rounded object-contain bg-white"
                      />
                    ) : (
                      <div className="h-32 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Not uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <SignedDocumentLink
                    storedPath={selectedApplication.nin_document_url}
                    bucket="documents"
                    label="Download NIN Document"
                  />
                  <SignedDocumentLink
                    storedPath={selectedApplication.signature_url}
                    bucket="signatures"
                    label="Download Signature"
                  />
                </div>
              </div>

              {/* Next of Kin */}
              <div>
                <h4 className="font-medium mb-3">Next of Kin Information</h4>
                <div className="p-4 rounded-lg border bg-muted/20">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{selectedApplication.next_of_kin_name || selectedApplication.referee1_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{selectedApplication.next_of_kin_phone || selectedApplication.referee1_phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-medium">{selectedApplication.next_of_kin_address || selectedApplication.referee1_address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleStatusUpdate(selectedApplication.id, 'under_review')}
                  disabled={isUpdating || selectedApplication.status === 'under_review'}
                >
                  Mark Under Review
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                  disabled={isUpdating || selectedApplication.status === 'approved'}
                  className="bg-success hover:bg-success/90"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeclineClick}
                  disabled={isUpdating || selectedApplication.status === 'declined'}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decline Reason Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={(open) => {
        if (!open) {
          setShowDeclineDialog(false);
          setDeclineReason('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Decline Application
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this account application. This will be visible to the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter reason for declining (required)..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeclineDialog(false);
              setDeclineReason('');
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDecline}
              disabled={isUpdating || !declineReason.trim()}
            >
              Confirm Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
