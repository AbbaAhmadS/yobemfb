import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Trash2, Settings, Shield, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminTools() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMD, setIsMD] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retentionEnabled, setRetentionEnabled] = useState(true);
  const [retentionDays, setRetentionDays] = useState(5);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [isRunningCleanup, setIsRunningCleanup] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [user]);

  const checkAccess = async () => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'managing_director',
      });

      if (error) throw error;

      if (!data) {
        toast.error('Access denied - Managing Director only');
        navigate('/admin/dashboard');
        return;
      }

      setIsMD(true);
      await loadSettings();
    } catch (error) {
      console.error('Access check error:', error);
      toast.error('Failed to verify access');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'retention_policy')
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        const valueObj = data.value as { enabled?: boolean; declined_retention_days?: number };
        setRetentionEnabled(valueObj.enabled ?? true);
        setRetentionDays(valueObj.declined_retention_days ?? 5);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load retention policy settings');
    }
  };

  const handleUpdateRetentionPolicy = async () => {
    setIsUpdatingSettings(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .update({
          value: {
            enabled: retentionEnabled,
            declined_retention_days: retentionDays,
          },
          updated_by: user?.id,
        })
        .eq('key', 'retention_policy');

      if (error) throw error;

      toast.success('Retention policy updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update retention policy');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleRunCleanupNow = async () => {
    setIsRunningCleanup(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-declined-uploads');

      if (error) throw error;

      if (data.deletedFiles === 0) {
        toast.info('No declined uploads found to clean up');
      } else {
        toast.success(
          `Cleanup completed: ${data.deletedFiles} file(s) deleted from ${data.declinedLoans || 0} declined loan(s) and ${data.declinedAccounts || 0} declined account application(s)`
        );
      }
    } catch (error) {
      console.error('Manual cleanup error:', error);
      toast.error('Failed to run cleanup');
    } finally {
      setIsRunningCleanup(false);
    }
  };

  const handlePurgeTestUsers = async () => {
    setIsPurging(true);
    try {
      const { data, error } = await supabase.functions.invoke('purge-test-users');

      if (error) throw error;

      toast.success(
        `Purged ${data.purgedUsers} test user(s): ${data.deletedLoanApps} loan apps, ${data.deletedAccountApps} account apps, ${data.deletedStorageObjects} files deleted`
      );
    } catch (error) {
      console.error('Purge error:', error);
      toast.error('Failed to purge test users');
    } finally {
      setIsPurging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isMD) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Admin Tools
          </h1>
          <p className="text-muted-foreground">Managing Director controls for system management</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Retention Policy Card */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Retention Policy</CardTitle>
            </div>
            <CardDescription>
              Automatically delete uploads for declined applications after a specified period to save storage space.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="retention-enabled" className="text-base">
                  Enable Retention Policy
                </Label>
                <p className="text-sm text-muted-foreground">
                  Auto-delete uploads for declined loan and account applications
                </p>
              </div>
              <Switch
                id="retention-enabled"
                checked={retentionEnabled}
                onCheckedChange={setRetentionEnabled}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="retention-days" className="text-base">
                Retention Period (Days)
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Files will be deleted after this many days from application decline
              </p>
              <input
                id="retention-days"
                type="number"
                min="1"
                max="365"
                value={retentionDays}
                onChange={(e) => setRetentionDays(Number(e.target.value))}
                className="w-32 px-3 py-2 border border-input rounded-md bg-background"
                disabled={!retentionEnabled}
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Cleanup runs automatically every 6 hours. Only uploads for{' '}
                <strong>declined</strong> applications older than {retentionDays} days will be deleted. Approved and pending
                applications are never affected.
              </p>
            </div>

            <Button onClick={handleUpdateRetentionPolicy} disabled={isUpdatingSettings}>
              {isUpdatingSettings ? 'Updating...' : 'Save Settings'}
            </Button>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold">Manual Cleanup</h3>
              <p className="text-sm text-muted-foreground">
                Trigger the cleanup process immediately instead of waiting for the scheduled run (every 6 hours).
              </p>
              <Button 
                variant="outline" 
                onClick={handleRunCleanupNow} 
                disabled={isRunningCleanup || !retentionEnabled}
              >
                {isRunningCleanup ? 'Running Cleanup...' : 'Run Cleanup Now'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card className="card-elevated border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Destructive actions that cannot be undone. Use with extreme caution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Purge Test Users</h3>
              <p className="text-sm text-muted-foreground">
                Removes all non-admin user accounts, their applications, and uploaded files. Admin accounts are never
                affected.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isPurging}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isPurging ? 'Purging...' : 'Purge Test Users'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>This action will permanently delete:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>All non-admin user accounts</li>
                        <li>All loan and account applications</li>
                        <li>All uploaded files (documents, signatures, photos)</li>
                        <li>All related database records</li>
                      </ul>
                      <p className="font-semibold text-destructive mt-3">
                        This action cannot be undone. Admin accounts are protected.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePurgeTestUsers} className="bg-destructive hover:bg-destructive/90">
                      Purge All Test Users
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
