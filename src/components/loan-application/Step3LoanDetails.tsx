import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoanStep3Data, SOLAR_PRODUCTS, getSolarProductPrice } from '@/types/database';
import { ArrowLeft, ArrowRight, Info, Sun, Battery } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';

const step3Schema = z.object({
  product_type: z.enum(['short_term', 'long_term']),
  loan_amount_range: z.enum(['100k_300k', '300k_600k', '600k_1m', 'above_1m']),
  specific_amount: z.number().min(100000, 'Minimum amount is ₦100,000'),
  repayment_period_months: z.number().min(9).max(12),
  bank_name: z.enum(['savings', 'current', 'corporate']),
  bank_account_number: z.string().length(10, 'Account number must be 10 digits'),
});

interface Step3Props {
  initialData: Partial<LoanStep3Data>;
  onSubmit: (data: LoanStep3Data) => void;
  onBack: () => void;
}

export function Step3LoanDetails({ initialData, onSubmit, onBack }: Step3Props) {
  const form = useForm<LoanStep3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      product_type: initialData.product_type || 'short_term',
      loan_amount_range: 'above_1m', // Fixed for solar products
      specific_amount: initialData.specific_amount || getSolarProductPrice(initialData.product_type || 'short_term'),
      repayment_period_months: initialData.repayment_period_months || 9,
      bank_name: initialData.bank_name || '',
      bank_account_number: initialData.bank_account_number || '',
    },
  });

  const selectedProduct = form.watch('product_type');

  // Update specific_amount when product type changes
  useEffect(() => {
    const price = getSolarProductPrice(selectedProduct);
    form.setValue('specific_amount', price);
    // Set appropriate loan_amount_range based on price
    form.setValue('loan_amount_range', 'above_1m');
  }, [selectedProduct, form]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Solar Product Selection */}
        <div>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Sun className="h-5 w-5 text-primary" />
            Select Your Solar Product
          </h3>
          
          <FormField
            control={form.control}
            name="product_type"
            render={({ field }) => (
              <FormItem>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Easy Solar Option */}
                  <Card 
                    className={`cursor-pointer transition-all ${
                      field.value === 'short_term' 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => field.onChange('short_term')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          field.value === 'short_term' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Battery className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{SOLAR_PRODUCTS.short_term.name}</h4>
                          <p className="text-2xl font-bold text-primary mt-1">
                            {formatPrice(SOLAR_PRODUCTS.short_term.price)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {SOLAR_PRODUCTS.short_term.description}
                          </p>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          field.value === 'short_term' ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}>
                          {field.value === 'short_term' && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Smart Solar Option */}
                  <Card 
                    className={`cursor-pointer transition-all relative ${
                      field.value === 'long_term' 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => field.onChange('long_term')}
                  >
                    <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs font-medium">
                      Popular
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          field.value === 'long_term' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Battery className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{SOLAR_PRODUCTS.long_term.name}</h4>
                          <p className="text-2xl font-bold text-primary mt-1">
                            {formatPrice(SOLAR_PRODUCTS.long_term.price)}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {SOLAR_PRODUCTS.long_term.description}
                          </p>
                        </div>
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          field.value === 'long_term' ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}>
                          {field.value === 'long_term' && (
                            <div className="h-2 w-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Selected Product Summary */}
        <Alert className="bg-primary/5 border-primary/20">
          <Sun className="h-4 w-4 text-primary" />
          <AlertDescription>
            <strong>Selected Product:</strong> {SOLAR_PRODUCTS[selectedProduct].name} - {formatPrice(getSolarProductPrice(selectedProduct))}
          </AlertDescription>
        </Alert>

        <FormField
          control={form.control}
          name="repayment_period_months"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repayment Period (Months)</FormLabel>
              <Select 
                onValueChange={(v) => field.onChange(Number(v))} 
                defaultValue={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select repayment period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="9">9 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose how long you want to repay the solar loan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-6 mt-6">
          <h3 className="font-medium mb-2">Disbursement Account</h3>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enter your YobeMFB bank account details for verification purposes.
              This is required for all solar loan applications.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YobeMFB Account Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="savings">Savings Account</SelectItem>
                      <SelectItem value="current">Current Account</SelectItem>
                      <SelectItem value="corporate">Corporate Account</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Your YobeMFB account type</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bank_account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YobeMFB Account Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter 10-digit account number" 
                      maxLength={10}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Your YobeMFB account number</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" size="lg" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button type="submit" size="lg">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
