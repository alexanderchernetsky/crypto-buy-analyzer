import {Pool} from "@/types/liquidity-pools";
import {calculateLiquidityPoolMetricsWithValidation} from "@/utils/calculateLiquidityPoolMetrics";

export interface PoolsSummary {
    openPositionsCount: number;
    totalInvested: number;
    totalProfitLoss: number;
    realisedProfitLoss: number;
    totalEarningPerDay: number;
}


/**
 * Calculate portfolio summary for liquidity pools.
 * Excludes `principal` and earnings from rows with status === "gathered".
 */
export function calculatePoolsSummary(pools: Pool[]): PoolsSummary {
    const openPositions = pools.filter(p => p.status === "open");
    const closedPositions = pools.filter(p => p.status === "closed");

    const openPositionsCount = openPositions.length;

    // ✅ Exclude gathered rows
    const totalInvested = openPositions.reduce((sum, pool) => {
        const poolPrincipal = pool.earningRows.reduce((rowSum, row) => {
            if (row.gathered === "no") {
                return rowSum + (row.principal || 0);
            }
            return rowSum;
        }, 0);
        return sum + poolPrincipal;
    }, 0);

    const totalProfitLoss = openPositions.reduce((sum, pool) => {
        const poolEarnings = pool.earningRows.reduce(
            (rowSum, row) => rowSum + row.earnings,
            0
        );
        return sum + poolEarnings;
    }, 0);

    const realisedProfitLossClosed = closedPositions.reduce((sum, pool) => {
        const poolEarnings = pool.earningRows.reduce(
            (rowSum, row) => rowSum + row.earnings,
            0
        );
        return sum + poolEarnings;
    }, 0);

    const realisedProfitLossOpen = openPositions.reduce((sum, pool) => {
        const poolEarnings = pool.earningRows.reduce((rowSum, row) => {
            if (row.gathered === "yes") {
                return rowSum + row.earnings;
            }
            return rowSum;
        }, 0);
        return sum + poolEarnings;
    }, 0);

    const realisedProfitLoss = realisedProfitLossClosed + realisedProfitLossOpen;

    // Total earning per day for open positions
    const totalEarningPerDay = openPositions.reduce((sum, pool) => {
        const metrics = calculateLiquidityPoolMetricsWithValidation({
            earningRows: pool.earningRows
        });

        return sum + metrics.earningPerDay;
    }, 0);

    return {
        openPositionsCount,
        totalInvested,
        totalProfitLoss,
        realisedProfitLoss,
        totalEarningPerDay,
    };
}
