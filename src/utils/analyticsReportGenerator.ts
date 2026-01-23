import type { LoanApplication } from "@/types/database";
import { getSolarProductName } from "@/types/database";

type ProductMonthlyRow = {
  month: string;
  cola1000Count: number;
  cola2000Count: number;
  cola1000Amount: number;
  cola2000Amount: number;
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const generateAnalyticsReportHtml = (params: {
  title: string;
  generatedAt: Date;
  dateFrom?: Date;
  dateTo?: Date;
  statusLabel: string;
  totalCount: number;
  totalAmount: number;
  cola1000Count: number;
  cola1000Amount: number;
  cola2000Count: number;
  cola2000Amount: number;
  monthly: ProductMonthlyRow[];
  loans: LoanApplication[];
}): string => {
  const rangeText =
    params.dateFrom || params.dateTo
      ? `${params.dateFrom ? formatDate(params.dateFrom) : "Any"} → ${params.dateTo ? formatDate(params.dateTo) : "Any"}`
      : "All dates";

  const tableRows = params.monthly
    .map(
      (r) => `
      <tr>
        <td>${r.month}</td>
        <td style="text-align:right">${r.cola1000Count}</td>
        <td style="text-align:right">${formatAmount(r.cola1000Amount)}</td>
        <td style="text-align:right">${r.cola2000Count}</td>
        <td style="text-align:right">${formatAmount(r.cola2000Amount)}</td>
      </tr>
    `,
    )
    .join("");

  const loanRows = params.loans
    .slice(0, 500)
    .map(
      (l) => `
      <tr>
        <td>${l.application_id}</td>
        <td>${l.full_name}</td>
        <td>${getSolarProductName(l.product_type)}</td>
        <td style="text-align:right">${formatAmount(l.specific_amount || 0)}</td>
        <td>${l.status}</td>
        <td>${new Date(l.created_at).toLocaleDateString("en-NG")}</td>
      </tr>
    `,
    )
    .join("");

  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${params.title}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
    h1 { font-size: 22px; margin: 0 0 6px; }
    .meta { color: #475569; font-size: 12px; margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 16px 0 22px; }
    .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
    .kpi-label { font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; }
    .kpi-value { font-size: 18px; font-weight: 700; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    th { text-align: left; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; background: #f8fafc; }
    .section-title { margin: 22px 0 10px; font-size: 14px; font-weight: 700; }
    .note { margin-top: 10px; font-size: 11px; color: #475569; }
    @media print { body { padding: 14px; } }
  </style>
</head>
<body>
  <h1>${params.title}</h1>
  <div class="meta">
    Generated: ${formatDate(params.generatedAt)}<br/>
    Date range: ${rangeText}<br/>
    Status filter: ${params.statusLabel}
  </div>

  <div class="grid">
    <div class="card">
      <div class="kpi-label">Total Cola Solar applications</div>
      <div class="kpi-value">${params.totalCount}</div>
    </div>
    <div class="card">
      <div class="kpi-label">Total amount (specific_amount)</div>
      <div class="kpi-value">${formatAmount(params.totalAmount)}</div>
    </div>
    <div class="card">
      <div class="kpi-label">Cola Solar 1000 Pro</div>
      <div class="kpi-value">${params.cola1000Count} • ${formatAmount(params.cola1000Amount)}</div>
    </div>
    <div class="card">
      <div class="kpi-label">Cola Solar 2000</div>
      <div class="kpi-value">${params.cola2000Count} • ${formatAmount(params.cola2000Amount)}</div>
    </div>
  </div>

  <div class="section-title">Monthly trend (by product)</div>
  <table>
    <thead>
      <tr>
        <th>Month</th>
        <th style="text-align:right">1000 Pro (count)</th>
        <th style="text-align:right">1000 Pro (amount)</th>
        <th style="text-align:right">2000 (count)</th>
        <th style="text-align:right">2000 (amount)</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows || `<tr><td colspan="5">No data in selected filters.</td></tr>`}
    </tbody>
  </table>

  <div class="section-title">Applications (first 500)</div>
  <table>
    <thead>
      <tr>
        <th>Application ID</th>
        <th>Full name</th>
        <th>Product</th>
        <th style="text-align:right">Amount</th>
        <th>Status</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      ${loanRows || `<tr><td colspan="6">No applications in selected filters.</td></tr>`}
    </tbody>
  </table>

  <div class="note">This report reflects the selected date range and status filter at the time of export.</div>
</body>
</html>
`;
};
