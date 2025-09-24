import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

export const LiquidityPoolsSummary = ({
                                          totalInvested,
                                          totalProfitLoss,
                                          realisedProfitLoss,
                                          openPositionsCount,
                                          totalEarningPerDay,
                                      }: {
    totalInvested: number;
    totalProfitLoss: number;
    realisedProfitLoss: number;
    openPositionsCount: number;
    totalEarningPerDay: number;
}) => {
    const positiveColor = "text-emerald-400";
    const negativeColor = "text-red-400";

    const summaryItems = [
        {
            label: "Open Positions",
            value: openPositionsCount,
            color: "text-slate-200",
            showIcon: false,
        },
        {
            label: "Total Invested",
            value: `$${totalInvested.toFixed(2)}`,
            color: "text-slate-200",
            showIcon: false,
        },
        {
            label: "Profit/Loss",
            value: `$${totalProfitLoss.toFixed(2)}`,
            color: totalProfitLoss >= 0 ? positiveColor : negativeColor,
            showIcon: true,
        },
        {
            label: "Realised P/L",
            value: `$${realisedProfitLoss.toFixed(2)}`,
            color: realisedProfitLoss >= 0 ? positiveColor : negativeColor,
            showIcon: true,
        },
        {
            label: "Daily Earning",
            value: `$${totalEarningPerDay.toFixed(2)}`,
            color: totalEarningPerDay >= 0 ? positiveColor : negativeColor,
            showIcon: true,
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {summaryItems.map(({ label, value, color, showIcon }, idx) => (
                <div
                    key={idx}
                    className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-lg p-5 border border-slate-700"
                >
                    <div className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">{label}</div>
                    <div className={`text-2xl font-bold flex items-center gap-2 ${color}`}>
                        {showIcon &&
                            (color === positiveColor ? (
                                <TrendingUp className="w-5 h-5" />
                            ) : (
                                <TrendingDown className="w-5 h-5" />
                            ))}
                        {value}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LiquidityPoolsSummary;
