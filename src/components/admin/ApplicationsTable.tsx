import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreVertical, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  Building2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoanApplication, ApplicationStatus, AppRole, STATUS_LABELS } from '@/types/database';
import { toast } from 'sonner';

interface ApplicationsTableProps {
  role: AppRole;
  userId: string;
}

const statusConfig: Record<ApplicationStatus, { className: string; icon: React.ElementType }> = {
  pending: { className: 'status-pending', icon: Clock },
  under_review: { className: 'status-under_review', icon: AlertTriangle },
  approved: { className: 'status-approved', icon: CheckCircle },
  declined: { className: 'status-declined', icon: XCircle },
  flagged: { className: 'status-flagged', icon: AlertTriangle },
};

export function ApplicationsTable({ role, userId }: ApplicationsTableProps) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data as LoanApplication[]);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    appId: string, 
    newStatus: ApplicationStatus,
    approvalField?: string
  ) => {
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (approvalField) {
        updateData[approvalField] = true;
        updateData[`${approvalField.replace('_approval', '_approved_by')}`] = userId;
        updateData[`${approvalField.replace('_approval', '_approved_at')}`] = new Date().toISOString();
      }

      const { error } = await supabase
        .from('loan_applications')
        .update(updateData)
        .eq('id', appId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        admin_user_id: userId,
        action_type: 'status_update',
        target_table: 'loan_applications',
        target_id: appId,
        new_status: newStatus,
      });

      toast.success('Application updated successfully');
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
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

  const getApprovalStatus = (app: LoanApplication) => {
    const approvals = [];
    if (app.credit_approval) approvals.push('Credit');
    if (app.audit_approval) approvals.push('Audit');
    if (app.coo_approval) approvals.push('COO');
    return approvals.length > 0 ? approvals.join(', ') : 'None';
  };

  const canApprove = (app: LoanApplication): boolean => {
    switch (role) {
      case 'credit':
        return !app.credit_approval && app.status !== 'approved' && app.status !== 'declined';
      case 'audit':
        return app.credit_approval === true && !app.audit_approval && app.status !== 'approved' && app.status !== 'declined';
      case 'coo':
        return app.audit_approval === true && !app.coo_approval && app.status !== 'approved' && app.status !== 'declined';
      default:
        return false;
    }
  };

  const filteredApplications = applications.filter(app =>
    app.application_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display">Loan Applications</CardTitle>
            <CardDescription>
              {filteredApplications.length} applications
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application ID</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approvals</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono font-medium">
                      {app.application_id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.full_name}</p>
                        <p className="text-sm text-muted-foreground">{app.ministry_department}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatAmount(app.specific_amount)}</TableCell>
                    <TableCell>{formatDate(app.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getApprovalStatus(app)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/application/${app.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {canApprove(app) && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(
                                  app.id, 
                                  role === 'coo' ? 'approved' : 'under_review',
                                  `${role}_approval`
                                )}
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-success" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusUpdate(app.id, 'declined')}
                              >
                                <XCircle className="h-4 w-4 mr-2 text-destructive" />
                                Decline
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
