'use client';
import React, { useMemo, useState } from 'react';
import { Calculator, Plus, X, Eye, EyeOff } from 'lucide-react';
import LiquidityPoolsSummary from '@/components/LPTracker/LiquidityPoolsSummary';
import LiquidityPoolCard from '@/components/LPTracker/LiquidityPoolCard';
import AddLiquidityPoolCard from '@/components/LPTracker/CreateLiquidityPoolCard';
import { usePools } from '@/react-query/useLiquidityPools';
import { useCoinGeckoTokenPrices } from '@/react-query/useCoinGeckoTokenPrices';
import { CoinGeckoPriceResponse } from '@/utils/api/fetchTokenPrices';
import { calculatePoolsSummary } from '@/utils/calculateLiquidityPoolsSummary';

const LiquidityPoolsPage: React.FC = () => {
	const { data: pools = [] } = usePools();
	const symbols = pools.map((pool) => pool.tokenSymbol);
	const uniqueSymbols = [...new Set(symbols)];
	const { data: prices = [] } = useCoinGeckoTokenPrices(uniqueSymbols);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showClosed, setShowClosed] = useState(false);

	const filteredPools = useMemo(
		() => (showClosed ? pools : pools.filter((p) => p.status !== 'closed')),
		[pools, showClosed],
	);
	const sortedPools = useMemo(
		() =>
			[...filteredPools].sort(
				(a, b) => new Date(b.earningRows[0].startDate).getTime() - new Date(a.earningRows[0].startDate).getTime(),
			),
		[filteredPools],
	);
	const summary = useMemo(() => calculatePoolsSummary(pools, prices as CoinGeckoPriceResponse), [pools, prices]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
			<div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
					<div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
						<h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
							<Calculator className="text-emerald-500" />
							Liquidity Pools Tracker
						</h1>
						<div className="flex flex-wrap gap-2">
							<button
								onClick={() => setShowClosed((prev) => !prev)}
								className={`cursor-pointer inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold text-white transition
                                    ${
																			showClosed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-600 hover:bg-slate-700'
																		} disabled:opacity-50 disabled:cursor-not-allowed`}
							>
								{showClosed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
								{showClosed ? 'Hide Closed' : 'Show Closed'}
							</button>
							<button
								onClick={() => setShowCreateForm(!showCreateForm)}
								className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
							>
								{showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
								{showCreateForm ? 'Cancel' : 'Create New Position'}
							</button>
						</div>
					</div>
				</div>

				{/* Create Pool Form */}
				{showCreateForm && <AddLiquidityPoolCard onClose={() => setShowCreateForm(false)} isOpen={showCreateForm} />}

				{/* Portfolio Summary */}
				<div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
					<LiquidityPoolsSummary {...summary} />
				</div>

				{/* Pool Cards */}
				<div className="space-y-4">
					{sortedPools.length === 0 ? (
						<div className="text-center text-slate-400 py-16">
							{showClosed ? 'No pools added yet.' : 'No open pools found.'}
						</div>
					) : (
						sortedPools.map((pool) => (
							<LiquidityPoolCard
								key={pool.id}
								initialData={pool}
								price={(prices as CoinGeckoPriceResponse)[pool.tokenSymbol]?.usd ?? 0}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default LiquidityPoolsPage;
