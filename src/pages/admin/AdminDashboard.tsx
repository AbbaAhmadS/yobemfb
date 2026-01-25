import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { MDAdminManagement } from '@/components/admin/MDAdminManagement';
import { 
  LayoutDashboard, FileText, Users, LogOut, Moon, Sun,
  CheckCircle, Clock, XCircle, AlertTriangle, Building2, CreditCard, BarChart3, Settings
} from 'lucide-react';
import { LoanApplication, ApplicationStatus, STATUS_LABELS, getSolarProductName } from '@/types/database';
import { toast } from 'sonner';
import yobemfbLogo from '@/assets/yobemfb-logo.jpeg';

type AdminRole = 'credit' | 'audit' | 'coo' | 'operations' | 'managing_director';

const statusConfig: Record<ApplicationStatus, { icon: React.ElementType; className: string }> = {
  pending: { icon: Clock, className: 'status-pending' },
  under_review: { icon: AlertTriangle, className: 'status-under_review' },
  approved: { icon: CheckCircle, className: 'status-approved' },
  declined: { icon: XCircle, className: 'status-declined' },
  flagged: { icon: AlertTriangle, className: 'status-flagged' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [role, setRole] = useState<AdminRole | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdminManagement, setShowAdminManagement] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    declined: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const fetchRoleAndRedirect = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

        if (data) {
          const userRole = data.role as AdminRole;
          setRole(userRole);
          
          // Redirect credit admins to their dedicated dashboard
          if (userRole === 'credit') {
            navigate('/admin/credit-dashboard');
            return;
          }
        } else {
          navigate('/admin/login');
        }
    };

    fetchRoleAndRedirect();
  }, [user, navigate]);

  useEffect(() => {
    if (role && role !== 'credit' && role !== 'operations') {
      fetchApplications();
    }
  }, [role]);

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

  const getRoleLabel = (role: AdminRole) => {
    const labels: Record<AdminRole, string> = {
      credit: 'Credit Department',
      audit: 'Internal Audit',
      coo: 'Chief Operations Officer',
      operations: 'Account Opening Department',
      managing_director: 'Managing Director',
    };
    return labels[role];
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

  // Filter applications based on search query
  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const query = searchQuery.toLowerCase();
    return applications.filter(app => 
      app.application_id.toLowerCase().includes(query) ||
      app.full_name.toLowerCase().includes(query) ||
      app.bank_account_number.toLowerCase().includes(query)
    );
  }, [applications, searchQuery]);

  if (!role) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r p-4 flex flex-col">
        <div className="mb-8">
          <img 
            src={yobemfbLogo} 
            alt="YobeMFB Logo" 
            className="h-12 w-auto object-contain mb-2"
          />
          <p className="text-sm text-muted-foreground">{getRoleLabel(role)}</p>
        </div>

        <nav className="space-y-2 flex-1">
          <Button variant="secondary" className="w-full justify-start gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2"
            onClick={() => navigate('/admin/analytics')}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" />
            Loan Applications
          </Button>
          {role === 'managing_director' && (
            <Button 
              variant={showAdminManagement ? 'secondary' : 'ghost'} 
              className="w-full justify-start gap-2"
              onClick={() => setShowAdminManagement(!showAdminManagement)}
            >
              <Users className="h-4 w-4" />
              Admin Management
            </Button>
          )}
          {role === 'managing_director' && (
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2"
              onClick={() => navigate('/admin/tools')}
            >
              <Settings className="h-4 w-4" />
              Admin Tools
            </Button>
          )}
        </nav>

        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to the admin portal</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <AdminSearchBar 
            onSearch={setSearchQuery}
            placeholder="Search by Application ID, Name, or Account Number..."
          />
        </div>

        {/* MD Admin Management Section */}
        {role === 'managing_director' && showAdminManagement && (
          <div className="mb-8">
            <MDAdminManagement />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-warning">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-warning opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-success">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Declined</p>
                  <p className="text-3xl font-bold text-destructive">{stats.declined}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Recent Solar Loan Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredApplications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {searchQuery ? 'No applications match your search.' : 'No applications found.'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredApplications.slice(0, 10).map((app) => (
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
                          {app.application_id} • {getSolarProductName(app.product_type)} • {formatDate(app.created_at)}
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
      </main>
    </div>
  );
}