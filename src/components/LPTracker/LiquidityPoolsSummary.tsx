import { TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

export const LiquidityPoolsSummary = ({
	totalInvested,
	totalProfitLoss,
	realisedProfitLoss,
	openPositionsCount,
	totalEarningPerDay,
	inRangeCount,
}: {
	totalInvested: number;
	totalProfitLoss: number;
	realisedProfitLoss: number;
	openPositionsCount: number;
	totalEarningPerDay: number;
	inRangeCount: number;
}) => {
	const positiveColor = 'text-emerald-400';
	const negativeColor = 'text-red-400';

	const summaryItems = [
		{
			label: 'Open Positions',
			// 🟢 Use a styled badge for range status
			value: (
				<span
					className={`px-3 py-1 text-sm font-semibold rounded-md ${
						inRangeCount === openPositionsCount && 'bg-emerald-600/20 text-emerald-400'
					}`}
				>
					{`${inRangeCount} / ${openPositionsCount} within range`}
				</span>
			),
			color: 'text-slate-200',
			showIcon: false,
		},
		{
			label: 'Total Invested',
			value: `$${totalInvested.toFixed(1)}`,
			color: 'text-slate-200',
			showIcon: false,
		},
		{
			label: 'Profit/Loss',
			value: `$${totalProfitLoss.toFixed(1)}`,
			color: totalProfitLoss >= 0 ? positiveColor : negativeColor,
			showIcon: true,
		},
		{
			label: 'Realised P/L',
			value: `$${realisedProfitLoss.toFixed(1)}`,
			color: realisedProfitLoss >= 0 ? positiveColor : negativeColor,
			showIcon: true,
		},
		{
			label: 'Daily Earning',
			value: `$${totalEarningPerDay.toFixed(1)}`,
			color: totalEarningPerDay >= 0 ? positiveColor : negativeColor,
			showIcon: true,
		},
		{
			label: 'Estimated Yield Per Month',
			value: `$${(totalEarningPerDay * 30).toFixed(1)}`,
			color: totalEarningPerDay >= 0 ? positiveColor : negativeColor,
			showIcon: true,
		},
	];

	return (
		<div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
			{summaryItems.map(({ label, value, color, showIcon }, idx) => (
				<div key={idx} className="bg-white/10 rounded-md p-4 border border-white/20 backdrop-blur-md">
					<div className="text-slate-300 text-sm mb-1">{label}</div>
					<div className={`text-xl font-bold flex items-center gap-2 ${color}`}>
						{showIcon &&
							(color === positiveColor ? (
								<TrendingUp className="w-4 h-4" />
							) : color === negativeColor ? (
								<TrendingDown className="w-4 h-4" />
							) : null)}
						{value}
					</div>
				</div>
			))}
		</div>
	);
};

export default LiquidityPoolsSummary;
