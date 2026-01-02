import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';

export default function OpenAccount() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-display text-2xl font-bold">Open Bank Account</h1>
          <p className="text-muted-foreground">Apply for a Yobe Microfinance Bank account</p>
        </div>
      </div>

      <Card className="card-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl">Account Opening Form</CardTitle>
          <CardDescription>
            The account opening form will be implemented here.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            This form will include:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-muted-foreground">
            <li>• Passport Photo Upload</li>
            <li>• Account Type Selection</li>
            <li>• Personal Details (Name, NIN, BVN)</li>
            <li>• NIN Document Upload</li>
            <li>• Signature Upload</li>
            <li>• Two Referees Information</li>
          </ul>
          <Button className="mt-6" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}