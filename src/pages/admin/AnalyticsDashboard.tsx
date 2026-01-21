import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Banknote,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoanApplication, AccountApplication } from '@/types/database';
import { toast } from 'sonner';

interface AnalyticsData {
  loanApplications: LoanApplication[];
  accountApplications: AccountApplication[];
  loanStats: {
    total: number;
    pending: number;
    approved: number;
    declined: number;
    underReview: number;
    flagged: number;
    totalAmount: number;
    avgAmount: number;
    totalApprovedAmount: number;
  };
  accountStats: {
    total: number;
    pending: number;
    approved: number;
    declined: number;
  };
  trends: {
    loansThisMonth: number;
    loansLastMonth: number;
    accountsThisMonth: number;
    accountsLastMonth: number;
  };
}

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { isAdmin, roles } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchAnalytics();
  }, [isAdmin, navigate]);

  const fetchAnalytics = async (start?: Date, end?: Date) => {
    setIsLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      let loanQuery = supabase.from('loan_applications').select('*');
      let accountQuery = supabase.from('account_applications').select('*');

      // Apply date filters if provided
      if (start) {
        const startStr = start.toISOString();
        loanQuery = loanQuery.gte('created_at', startStr);
        accountQuery = accountQuery.gte('created_at', startStr);
      }
      if (end) {
        const endStr = new Date(end.getTime() + 86400000).toISOString(); // Add 1 day for inclusive end
        loanQuery = loanQuery.lte('created_at', endStr);
        accountQuery = accountQuery.lte('created_at', endStr);
      }

      const [loanRes, accountRes] = await Promise.all([
        loanQuery.order('created_at', { ascending: false }),
        accountQuery.order('created_at', { ascending: false }),
      ]);

      if (loanRes.error) throw loanRes.error;
      if (accountRes.error) throw accountRes.error;

      const loans = (loanRes.data || []) as LoanApplication[];
      const accounts = (accountRes.data || []) as AccountApplication[];

      // Calculate loan stats
      const loanStats = {
        total: loans.length,
        pending: loans.filter(l => l.status === 'pending').length,
        approved: loans.filter(l => l.status === 'approved').length,
        declined: loans.filter(l => l.status === 'declined').length,
        underReview: loans.filter(l => l.status === 'under_review').length,
        flagged: loans.filter(l => l.status === 'flagged').length,
        totalAmount: loans.reduce((sum, l) => sum + (l.specific_amount || 0), 0),
        avgAmount: loans.length > 0 ? loans.reduce((sum, l) => sum + (l.specific_amount || 0), 0) / loans.length : 0,
        totalApprovedAmount: loans.reduce((sum, l) => sum + (l.approved_amount || 0), 0),
      };

      // Calculate account stats
      const accountStats = {
        total: accounts.length,
        pending: accounts.filter(a => a.status === 'pending').length,
        approved: accounts.filter(a => a.status === 'approved').length,
        declined: accounts.filter(a => a.status === 'declined').length,
      };

      // Calculate trends
      const loansThisMonth = loans.filter(l => new Date(l.created_at) >= startOfMonth).length;
      const loansLastMonth = loans.filter(l => {
        const date = new Date(l.created_at);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      }).length;
      const accountsThisMonth = accounts.filter(a => new Date(a.created_at) >= startOfMonth).length;
      const accountsLastMonth = accounts.filter(a => {
        const date = new Date(a.created_at);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      }).length;

      setAnalytics({
        loanApplications: loans,
        accountApplications: accounts,
        loanStats,
        accountStats,
        trends: {
          loansThisMonth,
          loansLastMonth,
          accountsThisMonth,
          accountsLastMonth,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateFilter = () => {
    fetchAnalytics(startDate, endDate);
  };

  const handleClearFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    fetchAnalytics();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
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
                Analytics Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Real-time application insights</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchAnalytics(startDate, endDate)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Date Range Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter by Date Range</CardTitle>
            <CardDescription>Select a date range to filter analytics data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">From:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">To:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={handleDateFilter} disabled={!startDate && !endDate}>
                Apply Filter
              </Button>
              {(startDate || endDate) && (
                <Button variant="ghost" onClick={handleClearFilter}>
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Solar Applications</p>
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{analytics.loanStats.total}</p>
              <div className="flex items-center gap-1 mt-2 text-sm">
                {getTrendIcon(analytics.trends.loansThisMonth, analytics.trends.loansLastMonth)}
                <span className={analytics.trends.loansThisMonth >= analytics.trends.loansLastMonth ? 'text-success' : 'text-destructive'}>
                  {getTrendPercentage(analytics.trends.loansThisMonth, analytics.trends.loansLastMonth)}%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Solar Value</p>
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{formatAmount(analytics.loanStats.totalAmount)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Avg: {formatAmount(analytics.loanStats.avgAmount)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Approved Solar Loans</p>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <p className="text-3xl font-bold text-success">{analytics.loanStats.approved}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Value: {formatAmount(analytics.loanStats.totalAmount * (analytics.loanStats.approved / (analytics.loanStats.total || 1)))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <p className="text-3xl font-bold">
                {analytics.loanStats.total > 0 
                  ? ((analytics.loanStats.approved / analytics.loanStats.total) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {analytics.loanStats.approved} of {analytics.loanStats.total} solar loans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Account Applications</p>
                <Users className="h-5 w-5 text-secondary" />
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
        </div>

        {/* Status Breakdown */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Loan Applications by Status</CardTitle>
              <CardDescription>Current distribution of loan applications</CardDescription>
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
                        style={{ width: `${(analytics.loanStats.pending / analytics.loanStats.total) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{analytics.loanStats.pending}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    <span>Under Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(analytics.loanStats.underReview / analytics.loanStats.total) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{analytics.loanStats.underReview}</span>
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
                        style={{ width: `${(analytics.loanStats.approved / analytics.loanStats.total) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{analytics.loanStats.approved}</span>
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
                        style={{ width: `${(analytics.loanStats.declined / analytics.loanStats.total) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{analytics.loanStats.declined}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${(analytics.loanStats.flagged / analytics.loanStats.total) * 100 || 0}%` }}
                      />
                    </div>
                    <span className="font-medium w-8">{analytics.loanStats.flagged}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Account Applications by Status</CardTitle>
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

              <div className="mt-8 p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">This Month Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Loan Applications</p>
                    <p className="text-lg font-semibold">{analytics.trends.loansThisMonth}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Account Applications</p>
                    <p className="text-lg font-semibold">{analytics.trends.accountsThisMonth}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
