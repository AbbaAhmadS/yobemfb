import { useMemo, useState, useEffect } from 'react';
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
  Download,
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
import { LoanApplication, ApplicationStatus } from '@/types/database';
import { computeSolarLoanBreakdown } from '@/lib/solar-analytics';
import { downloadCsv, toCsv } from '@/lib/csv';
import { generateAnalyticsReportHtml } from '@/utils/analyticsReportGenerator';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface AnalyticsData {
  loanApplications: LoanApplication[];
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
    productBreakdown: {
      short_term: { count: number; totalAmount: number };
      long_term: { count: number; totalAmount: number };
    };
  };
  trends: {
    loansThisMonth: number;
    loansLastMonth: number;
  };
}

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const { isAdmin, roles } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [loanStatusFilter, setLoanStatusFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');

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

      // Apply date filters if provided
      if (start) {
        const startStr = start.toISOString();
        loanQuery = loanQuery.gte('created_at', startStr);
      }
      if (end) {
        const endStr = new Date(end.getTime() + 86400000).toISOString(); // Add 1 day for inclusive end
        loanQuery = loanQuery.lte('created_at', endStr);
      }

      const loanRes = await loanQuery.order('created_at', { ascending: false });

      if (loanRes.error) throw loanRes.error;

      const loans = (loanRes.data || []) as LoanApplication[];

      const breakdown = computeSolarLoanBreakdown(loans);

      // Calculate loan stats
      const loanStats = {
        total: loans.length,
        pending: loans.filter(l => l.status === 'pending').length,
        approved: loans.filter(l => l.status === 'approved').length,
        declined: loans.filter(l => l.status === 'declined').length,
        underReview: loans.filter(l => l.status === 'under_review').length,
        flagged: loans.filter(l => l.status === 'flagged').length,
        totalAmount: breakdown.totalAmount,
        avgAmount: loans.length > 0 ? breakdown.totalAmount / loans.length : 0,
        totalApprovedAmount: loans.reduce((sum, l) => sum + (l.approved_amount || 0), 0),
        productBreakdown: breakdown.byProduct,
      };

      // Calculate trends
      const loansThisMonth = loans.filter(l => new Date(l.created_at) >= startOfMonth).length;
      const loansLastMonth = loans.filter(l => {
        const date = new Date(l.created_at);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      }).length;

      setAnalytics({
        loanApplications: loans,
        loanStats,
        trends: {
          loansThisMonth,
          loansLastMonth,
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

  const baseLoanApplications = analytics?.loanApplications ?? [];

  const filteredLoans = useMemo(() => {
    const base = baseLoanApplications;
    if (loanStatusFilter === 'all') return base;
    return base.filter((l) => l.status === (loanStatusFilter as ApplicationStatus));
  }, [baseLoanApplications, loanStatusFilter]);

  const filteredBreakdown = useMemo(() => computeSolarLoanBreakdown(filteredLoans), [filteredLoans]);

  const filteredLoanStats = useMemo(() => {
    const total = filteredLoans.length;
    const totalAmount = filteredBreakdown.totalAmount;
    return {
      total,
      totalAmount,
      avgAmount: total > 0 ? totalAmount / total : 0,
      byProduct: filteredBreakdown.byProduct,
    };
  }, [filteredLoans, filteredBreakdown]);

  const monthlyProductTrend = useMemo(() => {
    // Group by YYYY-MM and compute per-product counts and amounts
    const buckets = new Map<
      string,
      { month: string; cola1000Count: number; cola2000Count: number; cola1000Amount: number; cola2000Amount: number }
    >();

    for (const loan of filteredLoans) {
      const d = new Date(loan.created_at);
      // YYYY-MM for stable sort, label for display
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-NG', { year: 'numeric', month: 'short' });

      if (!buckets.has(key)) {
        buckets.set(key, {
          month: label,
          cola1000Count: 0,
          cola2000Count: 0,
          cola1000Amount: 0,
          cola2000Amount: 0,
        });
      }

      const b = buckets.get(key)!;
      const amount = loan.specific_amount || 0;
      if (loan.product_type === 'short_term') {
        b.cola1000Count += 1;
        b.cola1000Amount += amount;
      } else {
        b.cola2000Count += 1;
        b.cola2000Amount += amount;
      }
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [filteredLoans]);

  const statusLabel = loanStatusFilter === 'all'
    ? 'All statuses'
    : loanStatusFilter === 'pending'
      ? 'Pending'
      : loanStatusFilter === 'approved'
        ? 'Approved'
        : 'Declined';

  const handleExportCsv = () => {
    const csvRows = filteredLoans.map((l) => ({
      application_id: l.application_id,
      full_name: l.full_name,
      product_type: l.product_type,
      specific_amount: l.specific_amount || 0,
      repayment_period_months: l.repayment_period_months,
      status: l.status,
      created_at: l.created_at,
    }));

    const csv = toCsv(csvRows);
    const name = `analytics_solar_${loanStatusFilter}_${startDate ? startDate.toISOString().slice(0, 10) : 'all'}_${endDate ? endDate.toISOString().slice(0, 10) : 'all'}.csv`;
    downloadCsv(csv, name);
  };

  const handleExportPdf = () => {
    const html = generateAnalyticsReportHtml({
      title: 'Solar Loan Analytics Report',
      generatedAt: new Date(),
      dateFrom: startDate,
      dateTo: endDate,
      statusLabel,
      totalCount: filteredLoanStats.total,
      totalAmount: filteredLoanStats.totalAmount,
      cola1000Count: filteredLoanStats.byProduct.short_term.count,
      cola1000Amount: filteredLoanStats.byProduct.short_term.totalAmount,
      cola2000Count: filteredLoanStats.byProduct.long_term.count,
      cola2000Amount: filteredLoanStats.byProduct.long_term.totalAmount,
      monthly: monthlyProductTrend,
      loans: filteredLoans,
    });

    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    toast.success('Report opened — use Print to save as PDF');
    setTimeout(() => window.URL.revokeObjectURL(url), 5000);
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchAnalytics(startDate, endDate)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPdf}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
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
              <p className="text-3xl font-bold">{filteredLoanStats.total}</p>
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
              <p className="text-3xl font-bold">{formatAmount(filteredLoanStats.totalAmount)}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Avg: {formatAmount(filteredLoanStats.avgAmount)}
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
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <p className="text-3xl font-bold text-warning">{analytics.loanStats.pending}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {analytics.loanStats.underReview} under review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Solar Products Breakdown */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Easy Solar All-in-One 1000 (1kWh)</CardTitle>
              <CardDescription>₦630,000 per unit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{filteredLoanStats.byProduct.short_term.count}</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold">{formatAmount(filteredLoanStats.byProduct.short_term.totalAmount)}</p>
                  <p className="text-sm text-muted-foreground">Total amount</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Smart Solar 2000 All-in-One (2kWh)</CardTitle>
              <CardDescription>₦1,196,000 per unit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{filteredLoanStats.byProduct.long_term.count}</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold">{formatAmount(filteredLoanStats.byProduct.long_term.totalAmount)}</p>
                  <p className="text-sm text-muted-foreground">Total amount</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Filter Toggle (affects product breakdown + charts + exports) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Solar analytics filter</CardTitle>
            <CardDescription>Filter solar analytics by status (combined with date range)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'approved', label: 'Approved' },
                { key: 'declined', label: 'Declined' },
              ] as const).map((opt) => (
                <Button
                  key={opt.key}
                  type="button"
                  variant={loanStatusFilter === opt.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLoanStatusFilter(opt.key)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Product Trend Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly applications (by product)</CardTitle>
              <CardDescription>{statusLabel} • {startDate || endDate ? 'Date filtered' : 'All dates'}</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProductTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cola1000Count" name="Easy Solar 1000" fill="hsl(var(--primary))" />
                  <Bar dataKey="cola2000Count" name="Smart Solar 2000" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly total amount (by product)</CardTitle>
              <CardDescription>Sum of specific_amount</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProductTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `${Number(v) / 1000}k`} />
                  <Tooltip formatter={(v: any) => formatAmount(Number(v))} />
                  <Legend />
                  <Bar dataKey="cola1000Amount" name="Easy Solar 1000 amount" fill="hsl(var(--accent))" />
                  <Bar dataKey="cola2000Amount" name="Smart Solar 2000 amount" fill="hsl(var(--info))" />
                </BarChart>
              </ResponsiveContainer>
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
                    <AlertTriangle className="h-4 w-4 text-info" />
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-info rounded-full"
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
              <CardTitle className="font-display">This Month Summary</CardTitle>
              <CardDescription>Current month's solar loan activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <p className="text-muted-foreground">Loan Applications This Month</p>
                    <p className="text-4xl font-bold text-primary">{analytics.trends.loansThisMonth}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 rounded-lg bg-success/10">
                    <p className="text-muted-foreground">Approved</p>
                    <p className="text-xl font-semibold text-success">{analytics.loanStats.approved}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-destructive/10">
                    <p className="text-muted-foreground">Declined</p>
                    <p className="text-xl font-semibold text-destructive">{analytics.loanStats.declined}</p>
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
