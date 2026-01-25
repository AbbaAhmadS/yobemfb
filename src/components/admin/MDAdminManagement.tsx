import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  Shield, 
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  FileText,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  email?: string;
  full_name?: string;
}

interface AdminMetrics {
  totalAdmins: number;
  activeAdmins: number;
  pendingApplications: number;
  approvedThisMonth: number;
  declinedThisMonth: number;
  avgProcessingTime: string;
}

export function MDAdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  useEffect(() => {
    fetchAdminsAndMetrics();
  }, []);

  const fetchAdminsAndMetrics = async () => {
    setIsLoading(true);
    try {
      // Fetch admin users with their roles
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleError) throw roleError;

      // Fetch profile info for each admin
      const adminUsers: AdminUser[] = [];
      for (const role of roleData || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('user_id', role.user_id)
          .single();

        adminUsers.push({
          ...role,
          email: profile?.email || 'N/A',
          full_name: profile?.full_name || 'Unknown'
        });
      }

      setAdmins(adminUsers);

      // Calculate metrics
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: loanApps } = await supabase
        .from('loan_applications')
        .select('status, created_at, updated_at');

      const apps = loanApps || [];
      const approvedThisMonth = apps.filter(a => 
        a.status === 'approved' && new Date(a.updated_at) >= startOfMonth
      ).length;
      const declinedThisMonth = apps.filter(a => 
        a.status === 'declined' && new Date(a.updated_at) >= startOfMonth
      ).length;
      const pendingApplications = apps.filter(a => 
        ['pending', 'under_review'].includes(a.status)
      ).length;

      setMetrics({
        totalAdmins: adminUsers.length,
        activeAdmins: adminUsers.filter(a => a.is_active).length,
        pendingApplications,
        approvedThisMonth,
        declinedThisMonth,
        avgProcessingTime: '3-5 days'
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedAdmin || !newRole) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as 'credit' | 'audit' | 'coo' | 'managing_director' })
        .eq('id', selectedAdmin.id);

      if (error) throw error;

      toast.success(`Role updated to ${getRoleLabel(newRole)}`);
      setShowRoleDialog(false);
      setSelectedAdmin(null);
      setNewRole('');
      fetchAdminsAndMetrics();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const toggleAdminStatus = async (admin: AdminUser) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: !admin.is_active })
        .eq('id', admin.id);

      if (error) throw error;

      toast.success(`Admin ${admin.is_active ? 'deactivated' : 'activated'}`);
      fetchAdminsAndMetrics();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      credit: 'Credit Department',
      audit: 'Internal Audit',
      coo: 'Chief Operations Officer',
      managing_director: 'Managing Director'
    };
    return labels[role] || role;
  };

  const getRoleBadgeClass = (role: string) => {
    const classes: Record<string, string> = {
      managing_director: 'bg-primary text-primary-foreground',
      coo: 'bg-purple-500 text-white',
      audit: 'bg-orange-500 text-white',
      credit: 'bg-blue-500 text-white'
    };
    return classes[role] || 'bg-muted';
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics?.totalAdmins}</p>
                <p className="text-sm text-muted-foreground">Total Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics?.activeAdmins}</p>
                <p className="text-sm text-muted-foreground">Active Admins</p>
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
                <p className="text-2xl font-bold">{metrics?.pendingApplications}</p>
                <p className="text-sm text-muted-foreground">Pending Apps</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics?.approvedThisMonth}</p>
                <p className="text-sm text-muted-foreground">Approved (Month)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Monthly Performance Summary
          </CardTitle>
          <CardDescription>Application processing overview for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-success/10">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-3xl font-bold text-success">{metrics?.approvedThisMonth}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-3xl font-bold text-destructive">{metrics?.declinedThisMonth}</p>
              <p className="text-sm text-muted-foreground">Declined</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-3xl font-bold">{metrics?.avgProcessingTime}</p>
              <p className="text-sm text-muted-foreground">Avg. Processing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Users Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Admin Users
          </CardTitle>
          <CardDescription>Manage admin roles and permissions (Observer Mode)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${admin.is_active ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <Shield className={`h-5 w-5 ${admin.is_active ? 'text-success' : 'text-destructive'}`} />
                  </div>
                  <div>
                    <p className="font-medium">{admin.full_name}</p>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getRoleBadgeClass(admin.role)}>
                    {getRoleLabel(admin.role)}
                  </Badge>
                  <Badge variant={admin.is_active ? 'default' : 'destructive'}>
                    {admin.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setNewRole(admin.role);
                        setShowRoleDialog(true);
                      }}
                    >
                      Change Role
                    </Button>
                    <Button
                      variant={admin.is_active ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => toggleAdminStatus(admin)}
                    >
                      {admin.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Admin Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedAdmin?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Credit Department</SelectItem>
                <SelectItem value="audit">Internal Audit</SelectItem>
                <SelectItem value="coo">Chief Operations Officer</SelectItem>
                <SelectItem value="managing_director">Managing Director</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
