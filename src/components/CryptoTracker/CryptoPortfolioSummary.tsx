import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const CryptoPortfolioSummary = ({
	totalInvested,
	totalCurrentValue,
	totalProfitLoss,
	totalProfitLossPercentage,
	realisedProfitLoss,
	openPositionsCount,
}: {
	totalInvested: number;
	totalCurrentValue: number;
	totalProfitLoss: number;
	totalProfitLossPercentage: number;
	realisedProfitLoss: number;
	openPositionsCount: number;
}) => {
	const positiveColor = 'text-green-400';
	const negativeColor = 'text-red-400';

	const summaryItems = [
		{
			label: 'Open Positions',
			value: openPositionsCount,
			color: 'text-white',
			showIcon: false,
		},
		{
			label: 'Total Invested',
			value: `$${totalInvested.toFixed(2)}`,
			color: 'text-white',
			showIcon: false,
		},
		{
			label: 'Current Value',
			value: `$${totalCurrentValue.toFixed(2)}`,
			color: 'text-white',
			showIcon: false,
		},
		{
			label: 'Profit/Loss',
			value: `$${totalProfitLoss.toFixed(2)}`,
			color: totalProfitLoss >= 0 ? positiveColor : negativeColor,
			showIcon: true,
		},
		{
			label: 'Profit/Loss %',
			value: `${totalProfitLossPercentage >= 0 ? '+' : ''}${totalProfitLossPercentage.toFixed(2)}%`,
			color: totalProfitLossPercentage >= 0 ? positiveColor : negativeColor,
			showIcon: false,
		},
		{
			label: 'Realised P/L',
			value: `$${realisedProfitLoss.toFixed(2)}`,
			color: realisedProfitLoss >= 0 ? positiveColor : negativeColor,
			showIcon: true,
		},
	];

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-4 md:grid-cols-2 md:grid-rows-auto">
			{summaryItems.map(({ label, value, color, showIcon }, idx) => (
				<div key={idx} className="bg-white/10 rounded-md p-4 border border-white/20 backdrop-blur-md">
					<div className="text-slate-300 text-sm mb-1">{label}</div>
					<div className={`text-xl font-bold flex items-center gap-1 ${color}`}>
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
