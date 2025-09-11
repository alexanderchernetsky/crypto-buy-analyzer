'use client'
import React, { useMemo} from 'react';
import { Calculator } from 'lucide-react';
import LiquidityPoolsSummary from "@/components/LPTracker/LiquidityPoolsSummary";
import LiquidityPoolCard, {FormData} from "@/components/LPTracker/LiquidityPoolCard";

const LiquidityPoolsTrackerPage: React.FC = () => {
    const initialPools: FormData[] = [
        {
            poolName: 'LP1 - Orca SOL/USDC',
            startDate: '2024-09-08',
            endDate: '2024-09-11',
            rangeFrom: -20,
            rangeTo: 30,
            principal: 4177,
            earnings: 10.3,
            status: 'open',
        },
        {
            poolName: 'LP2 - Raydium SOL/USDT',
            startDate: '2024-08-01',
            endDate: '2024-08-10',
            rangeFrom: -10,
            rangeTo: 25,
            principal: 2500,
            earnings: 5.7,
            status: 'closed',
        },
    ];

    // -------- Summary Calculations --------
    const summary = useMemo(() => {
        const openPositions = initialPools.filter(p => p.status === 'open');
        const closedPositions = initialPools.filter(p => p.status === 'closed');
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
    }, [initialPools]);

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

                <div className="max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 mx-auto">
                    {initialPools.map((pool, index) => (
                        <LiquidityPoolCard key={index} initialData={pool} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LiquidityPoolsTrackerPage;
