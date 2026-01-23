import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { computeMonthlyRepayment } from "@/lib/repayment";
import { cn } from "@/lib/utils";
import { ArrowRight, CalendarClock, CheckCircle, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

type ProductInfo = {
  id: "cola_1000" | "cola_2000";
  title: string;
  subtitle: string;
  price: number;
  imageSrc: string;
  keyFeatures: string[];
  includedComponents: string[];
  whatItPowers: string[];
  highlight?: string;
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

export function SolarProductAccordionCard({
  product,
  recommended,
}: {
  product: ProductInfo;
  recommended?: boolean;
}) {
  const [months, setMonths] = useState<12 | 18>(18);

  const monthly = useMemo(
    () => computeMonthlyRepayment(product.price, months),
    [product.price, months],
  );

  return (
    <Card
      className={cn(
        "card-elevated overflow-hidden relative",
        recommended && "ring-2 ring-primary",
      )}
    >
      {recommended && (
        <div className="absolute top-4 right-4 z-10 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
          Recommended
        </div>
      )}

      <CardContent className="p-0">
        <div className="relative">
          <img
            src={product.imageSrc}
            alt={product.title}
            className="w-full h-72 object-cover object-top"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur border border-border/60 px-3 py-1.5 rounded-full text-xs">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">All-in-One Solar Power System</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-3">
              {product.title}
            </h3>
            <p className="text-muted-foreground">{product.subtitle}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-3xl font-bold">{formatAmount(product.price)}</p>
              {product.highlight && (
                <p className="text-sm text-muted-foreground mt-1">{product.highlight}</p>
              )}
            </div>

            <div className="w-full sm:w-auto">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                Repayment period
              </p>
              <div className="mt-2 inline-flex bg-muted rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setMonths(12)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors",
                    months === 12
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  12 months
                </button>
                <button
                  type="button"
                  onClick={() => setMonths(18)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors",
                    months === 18
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  18 months
                </button>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground">Estimated monthly repayment</p>
                <p className="text-lg font-semibold text-primary">
                  {formatAmount(monthly)}
                  <span className="text-xs text-muted-foreground font-normal">/month</span>
                </p>
              </div>
            </div>
          </div>

          <Accordion type="multiple" className="w-full">
            <AccordionItem value="features">
              <AccordionTrigger>Key Features</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm">
                  {product.keyFeatures.map((t) => (
                    <li key={t} className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{t}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="components">
              <AccordionTrigger>Included Components</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm">
                  {product.includedComponents.map((t) => (
                    <li key={t} className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{t}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="powers">
              <AccordionTrigger>What It Powers</AccordionTrigger>
              <AccordionContent>
                <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                  {product.whatItPowers.map((t) => (
                    <li key={t} className="bg-success/10 rounded-lg px-3 py-2 text-foreground">
                      {t}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button className="w-full" size="lg" asChild>
            <Link to="/auth?mode=signup">
              Apply for {product.title}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
