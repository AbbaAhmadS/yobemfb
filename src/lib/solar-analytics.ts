import type { LoanApplication, LoanProductType } from "@/types/database";

type ProductStats = {
  count: number;
  totalAmount: number;
};

export type SolarLoanBreakdown = {
  totalCount: number;
  totalAmount: number;
  byProduct: Record<LoanProductType, ProductStats>;
};

export const computeSolarLoanBreakdown = (
  loans: LoanApplication[],
): SolarLoanBreakdown => {
  const initial: SolarLoanBreakdown = {
    totalCount: 0,
    totalAmount: 0,
    byProduct: {
      short_term: { count: 0, totalAmount: 0 },
      long_term: { count: 0, totalAmount: 0 },
    },
  };

  return loans.reduce((acc, loan) => {
    const amount = loan.specific_amount || 0;
    acc.totalCount += 1;
    acc.totalAmount += amount;

    const key = loan.product_type;
    acc.byProduct[key].count += 1;
    acc.byProduct[key].totalAmount += amount;
    return acc;
  }, initial);
};
