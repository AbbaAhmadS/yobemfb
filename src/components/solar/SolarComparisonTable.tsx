import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Minus } from "lucide-react";

type ComparisonRow = {
  label: string;
  cola1000: React.ReactNode;
  cola2000: React.ReactNode;
};

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-3 text-sm text-foreground">{children}</div>
);

const HeaderCell = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
    {children}
  </div>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex gap-2">
    <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </li>
);

export function SolarComparisonTable() {
  const rows: ComparisonRow[] = [
    {
      label: "Battery capacity",
      cola1000: "1 kWh (LiFePO₄)",
      cola2000: "2 kWh (LiFePO₄)",
    },
    {
      label: "AC output",
      cola1000: "300 W (pure sine-wave)",
      cola2000: "1000 W (pure sine-wave)",
    },
    {
      label: "Solar panels",
      cola1000: "2 panels",
      cola2000: "4 panels",
    },
    {
      label: "Best for",
      cola1000: "Essential home power",
      cola2000: "Full household power",
    },
    {
      label: "What it powers (examples)",
      cola1000: (
        <ul className="space-y-1">
          <Bullet>Fridge (AC/DC fridge supported)</Bullet>
          <Bullet>TV × 2</Bullet>
          <Bullet>Bulbs × 6</Bullet>
          <Bullet>Fan</Bullet>
        </ul>
      ),
      cola2000: (
        <ul className="space-y-1">
          <Bullet>Fridge</Bullet>
          <Bullet>All house light bulbs</Bullet>
          <Bullet>TVs (up to 3)</Bullet>
          <Bullet>Pressing iron</Bullet>
          <Bullet>Electric heater / kettle heater</Bullet>
        </ul>
      ),
    },
    {
      label: "Charging",
      cola1000: "Solar + grid (AC)",
      cola2000: "Solar + grid (AC) + automatic switching",
    },
  ];

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="text-xl">Compare the two systems</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="grid grid-cols-12 border-b bg-muted/40">
            <div className="col-span-4">
              <HeaderCell>Specification</HeaderCell>
            </div>
            <div className="col-span-4">
              <HeaderCell>Cola Solar 1000 Pro</HeaderCell>
            </div>
            <div className="col-span-4">
              <HeaderCell>Cola Solar 2000</HeaderCell>
            </div>
          </div>

          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-12 border-b last:border-b-0">
              <div className="col-span-12 md:col-span-4">
                <Cell>
                  <span className="font-medium">{row.label}</span>
                </Cell>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Cell>{row.cola1000 ?? <Minus className="h-4 w-4 text-muted-foreground" />}</Cell>
              </div>
              <div className="col-span-12 md:col-span-4">
                <Cell>{row.cola2000 ?? <Minus className="h-4 w-4 text-muted-foreground" />}</Cell>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Tip: If you need to run heavier appliances (iron/heater) or more devices at once, Cola Solar 2000 is the better fit.
        </p>
      </CardContent>
    </Card>
  );
}
