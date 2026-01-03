import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  title: string;
}

const steps: Step[] = [
  { number: 1, title: 'Basic Info' },
  { number: 2, title: 'Identification' },
  { number: 3, title: 'Loan Details' },
  { number: 4, title: 'Guarantor' },
  { number: 5, title: 'Review' },
];

interface LoanFormProgressProps {
  currentStep: number;
}

export function LoanFormProgress({ currentStep }: LoanFormProgressProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                  currentStep > step.number
                    ? 'bg-primary text-primary-foreground'
                    : currentStep === step.number
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-2 text-center hidden sm:block',
                  currentStep >= step.number
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-1 flex-1 mx-2 rounded-full transition-all duration-300',
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
