export const computeMonthlyRepayment = (
  totalAmount: number,
  months: number,
): number => {
  if (!months || months <= 0) return 0;
  return totalAmount / months;
};
