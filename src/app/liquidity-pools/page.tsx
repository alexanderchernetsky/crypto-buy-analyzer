'use client';
import type React from 'react';
import { useMemo, useState } from 'react';
import { Calculator, Plus, X, Eye, EyeOff, ChevronDown } from 'lucide-react';
import LiquidityPoolsSummary from '@/components/LPTracker/LiquidityPoolsSummary';
import LiquidityPoolCard from '@/components/LPTracker/LiquidityPoolCard';
import AddLiquidityPoolCard from '@/components/LPTracker/CreateLiquidityPoolCard';
import { usePools } from '@/react-query/useLiquidityPools';
import type { CoinGeckoPriceResponse } from '@/utils/api/fetchTokenPrices';
import { calculatePoolsSummary } from '@/utils/calculateLiquidityPoolsSummary';
import {usePrices} from "@/react-query/usePrices";
import {calculateLiquidityPoolMetricsWithValidation} from "@/utils/calculateLiquidityPoolMetrics";
import type {PoolPosition} from "@/types/liquidity-pools";

const LiquidityPoolsPage: React.FC = () => {
	const { data: pools = [] } = usePools();
	const symbols = pools.map((pool) => pool.tokenSymbol);
	const { data: prices = [] } = usePrices(symbols);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showClosed, setShowClosed] = useState(false);
    const [selectedDex, setSelectedDex] = useState<string>('all');

	const filteredPools = useMemo(
		() => (showClosed ? pools : pools.filter((p) => p.status !== 'closed')),
		[pools, showClosed],
	);

    const poolPositions: PoolPosition[] = useMemo(() => {
        return filteredPools.map(position => {
            const metrics = calculateLiquidityPoolMetricsWithValidation({
                earningRows: position.earningRows,
            });

            const positionWithCalculations: PoolPosition = {
                ...position,
                calculations: metrics,
            }

            return positionWithCalculations;
        })
    }, [filteredPools]);

    // Get unique DEX options from poolPositions
    const dexOptions = useMemo(() => {
        const uniqueDexes = Array.from(new Set(poolPositions.map(p => p.dex))).sort();
        return uniqueDexes;
    }, [poolPositions]);

    console.log('poolPositions', poolPositions);

    // Filter by selected DEX and sorted
    const filteredByDex = useMemo(() => {
        if (selectedDex === 'all') return poolPositions;
        return poolPositions.filter(p => p.dex === selectedDex);
    }, [poolPositions, selectedDex]);

    const sortedPoolPositions = useMemo(() => {
        return [...filteredByDex].sort(
            (a, b) => new Date(b.earningRows[0].startDate).getTime() - new Date(a.earningRows[0].startDate).getTime(),
        );
    }, [filteredByDex]);

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
                                type="button"
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

                {/* Filters */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 mb-6 shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                        {/* Title */}
                        <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-lg font-semibold text-slate-200">Filters</h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* DEX Filter */}
                            <div className="relative">
                                <select
                                    value={selectedDex}
                                    onChange={(e) => setSelectedDex(e.target.value)}
                                    className="appearance-none cursor-pointer rounded-lg bg-slate-700 text-slate-200 border border-slate-600 py-2 pl-3 pr-10 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                >
                                    <option value="all">All DEXs</option>
                                    {dexOptions.map((dex) => (
                                        <option key={dex} value={dex}>
                                            {dex}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                                />
                            </div>

                            {/* Show Closed Toggle */}
                            <button
                                type="button"
                                onClick={() => setShowClosed((prev) => !prev)}
                                className={`cursor-pointer inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold text-white transition
                                    ${
                                    showClosed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-600 hover:bg-slate-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {showClosed ?  <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {showClosed ? 'Hide Closed' : 'Show Closed'}
                            </button>
                        </div>
                    </div>
                </div>


                {/* Pool Cards */}
				<div className="space-y-4">
					{sortedPoolPositions.length === 0 ? (
						<div className="text-center text-slate-400 py-16">
							{showClosed ? 'No pools added yet.' : 'No open pools found.'}
						</div>
					) : (
                        sortedPoolPositions.map((poolPosition) => (
							<LiquidityPoolCard
								key={poolPosition.id}
								initialData={poolPosition}
								price={(prices as CoinGeckoPriceResponse)[poolPosition.tokenSymbol]?.usd ?? 0}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default LiquidityPoolsPage;
