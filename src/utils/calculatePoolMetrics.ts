import {EarningRow} from "@/components/LPTracker/CreateLiquidityPoolCard";

interface PoolMetrics {
    days: number;
    earningPerDay: number;
    apr: number;
}

interface CalculateMetricsParams {
    earningRows: EarningRow[];
    principal: number;
}

/**
 * Calculates pool position metrics including total days, daily earnings, and APR
 * @param params - Object containing earning rows and principal amount
 * @returns PoolMetrics object with calculated values
 */
export const calculatePoolMetrics = ({
                                         earningRows,
                                         principal
                                     }: CalculateMetricsParams): PoolMetrics => {
    // Return zero values if no earning rows exist
    if (earningRows.length === 0) {
        return {
            days: 0,
            earningPerDay: 0,
            apr: 0,
        };
    }

    let totalDays = 0;
    let totalEarnings = 0;

    // Calculate total days and earnings across all rows
    earningRows.forEach((row) => {
        if (row.startDate && row.endDate) {
            const start = new Date(row.startDate);
            const end = new Date(row.endDate);
            const timeDiff = end.getTime() - start.getTime();
            const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
            totalDays += Math.max(0, days); // Ensure non-negative days
        }
        totalEarnings += row.earnings;
    });

    // Calculate metrics
    const earningPerDay = totalDays > 0 ? totalEarnings / totalDays : 0;
    const dailyReturn = principal > 0 ? earningPerDay / principal : 0;
    const apr = dailyReturn * 365 * 100; // Convert to percentage

    return {
        days: totalDays,
        earningPerDay,
        apr,
    };
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
        row.earnings >= 0
    );
};

/**
 * Enhanced version that only includes valid earning rows in calculations
 * @param params - Object containing earning rows and principal amount
 * @returns PoolMetrics object with calculated values
 */
export const calculatePoolMetricsWithValidation = ({
                                                       earningRows,
                                                       principal
                                                   }: CalculateMetricsParams): PoolMetrics => {
    const validRows = earningRows.filter(isValidEarningRow);

    return calculatePoolMetrics({
        earningRows: validRows,
        principal
    });
};
