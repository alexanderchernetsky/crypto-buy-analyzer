import { EarningRow } from '@/types/liquidity-pools';

interface PoolMetrics {
	days: number;
	earningPerDay: number;
	apr: number;
}

interface CalculateMetricsParams {
	earningRows: EarningRow[];
}

/**
 * Calculates pool position metrics including total days, daily earnings, and APR
 * @param params - Object containing earning rows
 * @returns PoolMetrics object with calculated values
 */
export const calculateLiquidityPoolMetrics = ({ earningRows }: CalculateMetricsParams): PoolMetrics => {
	if (earningRows.length === 0) {
		return { days: 0, earningPerDay: 0, apr: 0 };
	}

	let totalDays = 0;
	let totalEarnings = 0;
	let weightedReturnSum = 0;
	let weightedBasis = 0;

	earningRows.forEach((row) => {
		const start = new Date(row.startDate);
		const end = new Date(row.endDate);
		const days = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
		totalDays += days;
		totalEarnings += row.earnings;

		if (row.principal > 0 && days > 0) {
			const dailyReturn = row.earnings / (row.principal * days);
			weightedReturnSum += dailyReturn * row.principal * days;
			weightedBasis += row.principal * days;
		}
	});

	const earningPerDay = totalDays > 0 ? totalEarnings / totalDays : 0;
	const dailyReturn = weightedBasis > 0 ? weightedReturnSum / weightedBasis : 0;
	const apr = dailyReturn * 365 * 100;

	return { days: totalDays, earningPerDay, apr };
};

/**
 * Utility function to validate earning row data
 * @param row - EarningRow to validate
 * @returns boolean indicating if the row has valid data
 */
export const isValidEarningRow = (row: EarningRow): boolean => {
	return !!(
		row.startDate &&
		row.endDate &&
		new Date(row.startDate) <= new Date(row.endDate) &&
		row.earnings >= 0 &&
		row.principal >= 0
	);
};

/**
 * Enhanced version that only includes valid earning rows in calculations
 * @param params - Object containing earning rows
 * @returns PoolMetrics object with calculated values
 */
export const calculateLiquidityPoolMetricsWithValidation = ({ earningRows }: CalculateMetricsParams): PoolMetrics => {
	const validRows = earningRows.filter(isValidEarningRow);

	return calculateLiquidityPoolMetrics({
		earningRows: validRows,
	});
};
