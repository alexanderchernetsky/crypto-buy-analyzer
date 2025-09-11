import {TrendingDown, TrendingUp} from "lucide-react";
import React from "react";

export const LiquidityPoolsSummary = ({
                                           totalInvested,
                                           totalProfitLoss,
                                           realisedProfitLoss,
                                           openPositionsCount,
                                       }: {
    totalInvested: number;
    totalProfitLoss: number;
    realisedProfitLoss: number;
    openPositionsCount: number;
}) => {
    const positiveColor = 'text-green-600';
    const negativeColor = 'text-red-600';

    const summaryItems = [
        {
            label: 'Open Positions',
            value: openPositionsCount,
            color: 'text-gray-900',
            showIcon: false,
        },
        {
            label: 'Total Invested',
            value: `$${totalInvested.toFixed(2)}`,
            color: 'text-gray-900',
            showIcon: false,
        },
        {
            label: 'Profit/Loss',
            value: `$${totalProfitLoss.toFixed(2)}`,
            color: totalProfitLoss >= 0 ? positiveColor : negativeColor,
            showIcon: true,
        },
        {
            label: 'Realised P/L',
            value: `$${realisedProfitLoss.toFixed(2)}`,
            color: realisedProfitLoss >= 0 ? positiveColor : negativeColor,
            showIcon: true,
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryItems.map(({ label, value, color, showIcon }, idx) => (
                <div
                    key={idx}
                    className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
                >
                    <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
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
