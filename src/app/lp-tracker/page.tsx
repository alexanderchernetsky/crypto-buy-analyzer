'use client'
import React, { useMemo, useState } from 'react';
import { Calculator, Plus, X } from 'lucide-react';
import LiquidityPoolsSummary from "@/components/LPTracker/LiquidityPoolsSummary";
import LiquidityPoolCard from "@/components/LPTracker/LiquidityPoolCard";
import AddLiquidityPoolCard from "@/components/LPTracker/CreateLiquidityPoolCard";
import { usePools } from "@/react-query/useLiquidityPools";

const LiquidityPoolsTrackerPage: React.FC = () => {
    const { data: pools = [] } = usePools();
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Sort pools by startDate (newest first)
    const sortedPools = useMemo(() => {
        return [...pools].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [pools]);

    // -------- Summary Calculations --------
    const summary = useMemo(() => {
        const openPositions = pools.filter(p => p.status === 'open');
        const closedPositions = pools.filter(p => p.status === 'closed');
        const openPositionsCount = openPositions.length;
        const totalInvested = openPositions.reduce((sum, p) => sum + p.principal, 0);
        const profitLoss = openPositions.reduce((sum, p) => sum + p.earnings, 0);
        const realisedProfitLoss = closedPositions.reduce((sum, p) => sum + p.earnings, 0);

        // Calculate total earning per day for open positions
        const totalEarningPerDay = openPositions.reduce((sum, pool) => {
            const startDate = new Date(pool.startDate);
            const currentDate = new Date();
            const daysDiff = Math.max(1, Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
            const dailyEarning = pool.earnings / daysDiff;
            return sum + dailyEarning;
        }, 0);

        return {
            openPositionsCount,
            totalInvested,
            totalProfitLoss: profitLoss,
            realisedProfitLoss,
            totalEarningPerDay,
        };
    }, [pools]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Enhanced Header with integrated Create Pool Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                    <div className="flex items-center gap-4 mb-6 sm:mb-0">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                            <Calculator className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Liquidity Pool Calculator
                            </h1>
                            <p className="text-gray-600 text-sm mt-2">Track and manage your DeFi positions with ease</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(prev => !prev)}
                        className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {showCreateForm ? (
                            <>
                                <X className="w-5 h-5 relative z-10" />
                                <span className="relative z-10">Cancel</span>
                            </>
                        ) : (
                            <>
                                <Plus className="w-5 h-5 relative z-10" />
                                <span className="relative z-10">Create Pool</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Enhanced Create Pool Form */}
                <AddLiquidityPoolCard onClose={() => setShowCreateForm(false)} isOpen={showCreateForm} />

                {/* Enhanced Portfolio Summary */}
                <div className="mb-12">
                    <LiquidityPoolsSummary {...summary} />
                </div>

                {/* Enhanced Pool Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {pools.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                                <Calculator className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No pools yet</h3>
                            <p className="text-gray-500 mb-6 max-w-md">Start by creating your first liquidity pool to begin tracking your DeFi positions.</p>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                            >
                                Create Your First Pool
                            </button>
                        </div>
                    ) : (
                        sortedPools.map((pool) => (
                            <LiquidityPoolCard  key={pool.id} initialData={pool} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiquidityPoolsTrackerPage
