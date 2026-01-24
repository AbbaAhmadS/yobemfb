import { Link } from "react-router-dom";
import { ArrowRight, Battery, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SolarProductAccordionCard } from "@/components/solar/SolarProductAccordionCard";
import { SolarComparisonTable } from "@/components/solar/SolarComparisonTable";
import { solarProducts } from "@/lib/solar-products";

export default function Products() {
  return (
    <div className="overflow-hidden">
      <header className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Battery className="h-4 w-4" />
              Cola Solar Systems
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choose the right solar system for your home
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              See deeper specs, warranty information, and what each system powers. Apply today and pay over 12 or 18 months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <Link to="/auth?mode=signup">
                  Apply for Solar Loan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link to="/apply-loan">Continue Application</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
              <div className="space-y-6">
                <SolarProductAccordionCard product={solarProducts[0]} />
                <Card className="card-elevated">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h2 className="font-display text-lg font-semibold">Warranty & Support</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium text-foreground">{solarProducts[0].warranty.durationLabel}:</span>{" "}
                          {solarProducts[0].warranty.summary}
                        </p>
                        <ul className="mt-4 space-y-2 text-sm">
                          <li className="flex gap-2">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                            <span className="text-foreground">All-in-one unit designed for safe, clean power output.</span>
                          </li>
                          <li className="flex gap-2">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                            <span className="text-foreground">Repayment options: 12 or 18 months.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <SolarProductAccordionCard product={solarProducts[1]} recommended />
                <Card className="card-elevated">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h2 className="font-display text-lg font-semibold">Warranty & Support</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium text-foreground">{solarProducts[1].warranty.durationLabel}:</span>{" "}
                          {solarProducts[1].warranty.summary}
                        </p>
                        <ul className="mt-4 space-y-2 text-sm">
                          <li className="flex gap-2">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                            <span className="text-foreground">Automatic grid switching for seamless transition during outages.</span>
                          </li>
                          <li className="flex gap-2">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                            <span className="text-foreground">Repayment options: 12 or 18 months.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="max-w-6xl mx-auto mt-12">
              <SolarComparisonTable />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
