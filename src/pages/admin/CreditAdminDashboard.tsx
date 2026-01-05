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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogOut,
  Moon,
  Sun,
  Users,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { LoanApplication, ApplicationStatus, STATUS_LABELS, LOAN_AMOUNT_LABELS } from '@/types/database';
import { toast } from 'sonner';

const statusConfig: Record<ApplicationStatus, { icon: React.ElementType; className: string }> = {
  pending: { icon: Clock, className: 'status-pending' },
  under_review: { icon: AlertTriangle, className: 'status-under_review' },
  approved: { icon: CheckCircle, className: 'status-approved' },
  declined: { icon: XCircle, className: 'status-declined' },
  flagged: { icon: AlertTriangle, className: 'status-flagged' },
};

export default function CreditAdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    declined: 0,
  });

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
        .order('created_at', { ascending: false });

      if (error) throw error;

      const apps = (data || []) as LoanApplication[];
      setApplications(apps);

      setStats({
        total: apps.length,
        pending: apps.filter((a) => a.status === 'pending').length,
        approved: apps.filter((a) => a.status === 'approved').length,
        declined: apps.filter((a) => a.status === 'declined').length,
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
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

  const getStatusBadge = (status: ApplicationStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {STATUS_LABELS[status]}
      </Badge>
    );
  };

  const filterApplications = (status?: ApplicationStatus) => {
    if (!status) return applications;
    return applications.filter((app) => app.status === status);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">Y</span>
            </div>
            <div>
              <h1 className="font-display font-semibold text-lg">Credit Department</h1>
              <p className="text-sm text-muted-foreground">Loan Application Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin/analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
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
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.declined}</p>
                  <p className="text-sm text-muted-foreground">Declined</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Customer Application
            </CardTitle>
            <CardDescription>
              Create a new loan application on behalf of a customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin/create-application')}>
              <Plus className="h-4 w-4 mr-2" />
              New Customer Application
            </Button>
          </CardContent>
        </Card>

        {/* Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Loan Applications</CardTitle>
            <CardDescription>Review and manage loan applications</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                <TabsTrigger value="declined">Declined ({stats.declined})</TabsTrigger>
              </TabsList>

              {['all', 'pending', 'approved', 'declined'].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : (
                    <div className="space-y-3">
                      {filterApplications(tab === 'all' ? undefined : (tab as ApplicationStatus)).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No applications found</div>
                      ) : (
                        filterApplications(tab === 'all' ? undefined : (tab as ApplicationStatus)).map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/admin/applications/${app.id}`)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{app.full_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {app.application_id} • {formatAmount(app.specific_amount)} • {formatDate(app.created_at)}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(app.status)}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
