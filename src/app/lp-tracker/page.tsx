'use client'
import React, { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';
import LiquidityPoolsSummary from "@/components/LPTracker/LiquidityPoolsSummary";
import LiquidityPoolCard from "@/components/LPTracker/LiquidityPoolCard";
import AddLiquidityPoolCard from "@/components/LPTracker/CreateLiquidityPoolCard";
import { usePools } from "@/react-query/useLiquidityPools";

const LiquidityPoolsTrackerPage: React.FC = () => {
    const { data: pools = [] } = usePools();
    const [showCreateForm, setShowCreateForm] = useState(false);

    // -------- Summary Calculations --------
    const summary = useMemo(() => {
        const openPositions = pools.filter(p => p.status === 'open');
        const closedPositions = pools.filter(p => p.status === 'closed');
        const openPositionsCount = openPositions.length;
        const totalInvested = openPositions.reduce((sum, p) => sum + p.principal, 0);
        const profitLoss = openPositions.reduce((sum, p) => sum + p.earnings, 0);
        const realisedProfitLoss = closedPositions.reduce((sum, p) => sum + p.earnings, 0);

        return {
            openPositionsCount,
            totalInvested,
            totalProfitLoss: profitLoss,
            realisedProfitLoss,
        };
    }, [pools]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <Calculator className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Liquidity Pool Calculator
                        </h1>
                    </div>
                </div>

                {/* Portfolio Summary */}
                <LiquidityPoolsSummary {...summary} />

                {/* Create Pool Button */}
                <div className="mb-6 text-center">
                    <button
                        onClick={() => setShowCreateForm(prev => !prev)}
                        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
                    >
                        {showCreateForm ? "Cancel" : "Create Pool"}
                    </button>
                </div>

                {/* Add new pool form */}
                {showCreateForm && (
                    <div className="mb-12">
                        <AddLiquidityPoolCard />
                    </div>
                )}

                {/* Existing pools */}
                <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 mx-auto">
                    {pools.map((pool, index) => (
                        <LiquidityPoolCard key={index} initialData={pool} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiquidityPoolsTrackerPage;
