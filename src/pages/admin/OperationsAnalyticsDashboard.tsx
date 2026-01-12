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
  Building2,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AccountApplication {
  id: string;
  user_id: string;
  application_id: string;
  full_name: string;
  account_type: 'savings' | 'current' | 'corporate';
  status: 'pending' | 'under_review' | 'approved' | 'declined' | 'flagged' | null;
  created_at: string;
  updated_at: string;
}

interface OperationsAnalyticsData {
  accountApplications: AccountApplication[];
  accountStats: {
    total: number;
    pending: number;
    approved: number;
    declined: number;
    underReview: number;
    savingsAccounts: number;
    currentAccounts: number;
    corporateAccounts: number;
  };
  trends: {
    accountsThisMonth: number;
    accountsLastMonth: number;
    savingsThisMonth: number;
    currentThisMonth: number;
  };
}

export default function OperationsAnalyticsDashboard() {
  const navigate = useNavigate();
  const { isAdmin, roles } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<OperationsAnalyticsData | null>(null);

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

      // Only fetch account applications for operations
      const { data: accountData, error: accountError } = await supabase
        .from('account_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (accountError) throw accountError;

      const accounts = (accountData || []) as AccountApplication[];

      // Calculate account stats
      const accountStats = {
        total: accounts.length,
        pending: accounts.filter(a => a.status === 'pending').length,
        approved: accounts.filter(a => a.status === 'approved').length,
        declined: accounts.filter(a => a.status === 'declined').length,
        underReview: accounts.filter(a => a.status === 'under_review').length,
        savingsAccounts: accounts.filter(a => a.account_type === 'savings').length,
        currentAccounts: accounts.filter(a => a.account_type === 'current').length,
        corporateAccounts: accounts.filter(a => a.account_type === 'corporate').length,
      };

      // Calculate trends
      const accountsThisMonth = accounts.filter(a => new Date(a.created_at) >= startOfMonth).length;
      const accountsLastMonth = accounts.filter(a => {
        const date = new Date(a.created_at);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      }).length;

      const savingsThisMonth = accounts.filter(a => 
        new Date(a.created_at) >= startOfMonth && a.account_type === 'savings'
      ).length;

      const currentThisMonth = accounts.filter(a => 
        new Date(a.created_at) >= startOfMonth && a.account_type === 'current'
      ).length;

      setAnalytics({
        accountApplications: accounts,
        accountStats,
        trends: {
          accountsThisMonth,
          accountsLastMonth,
          savingsThisMonth,
          currentThisMonth,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
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
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display font-semibold text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Operations Analytics
              </h1>
              <p className="text-sm text-muted-foreground">Account opening insights</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Account Applications</p>
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
                <p className="text-sm text-muted-foreground">Savings Accounts</p>
                <Wallet className="h-5 w-5 text-success" />
              </div>
              <p className="text-3xl font-bold">{analytics.accountStats.savingsAccounts}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {analytics.trends.savingsThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Current Accounts</p>
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{analytics.accountStats.currentAccounts}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {analytics.trends.currentThisMonth} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Corporate Accounts</p>
                <Building2 className="h-5 w-5 text-secondary" />
              </div>
              <p className="text-3xl font-bold">{analytics.accountStats.corporateAccounts}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Business accounts
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
              <CardTitle className="font-display">Account Types Distribution</CardTitle>
              <CardDescription>Breakdown by account type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-success" />
                    <span>Savings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full"
                        style={{ width: `${(analytics.accountStats.savingsAccounts / analytics.accountStats.total) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{analytics.accountStats.savingsAccounts}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span>Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(analytics.accountStats.currentAccounts / analytics.accountStats.total) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{analytics.accountStats.currentAccounts}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-secondary" />
                    <span>Corporate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${(analytics.accountStats.corporateAccounts / analytics.accountStats.total) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{analytics.accountStats.corporateAccounts}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">This Month Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">New Applications</p>
                    <p className="text-lg font-semibold">{analytics.trends.accountsThisMonth}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Approval Rate</p>
                    <p className="text-lg font-semibold">
                      {analytics.accountStats.total > 0 
                        ? ((analytics.accountStats.approved / analytics.accountStats.total) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recent Account Applications</CardTitle>
            <CardDescription>Latest account opening requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.accountApplications.slice(0, 10).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{app.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.application_id} • {app.account_type.charAt(0).toUpperCase() + app.account_type.slice(1)} Account
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    app.status === 'approved' ? 'bg-success/10 text-success' :
                    app.status === 'declined' ? 'bg-destructive/10 text-destructive' :
                    app.status === 'pending' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {app.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                  </span>
                </div>
              ))}
              {analytics.accountApplications.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No account applications found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
