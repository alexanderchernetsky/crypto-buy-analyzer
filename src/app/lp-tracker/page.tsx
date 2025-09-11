'use client'
import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign } from 'lucide-react';

interface FormData {
    poolName: string;
    startDate: string;
    endDate: string;
    rangeFrom: number;
    rangeTo: number;
    principal: number;
    earnings: number;
}

interface Calculations {
    days: number;
    earningPerDay: number;
    apr: number;
}

type FormField = keyof FormData;
type NumericField = 'rangeFrom' | 'rangeTo' | 'principal' | 'earnings';

const LiquidityPoolsTrackerPage: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        poolName: 'LP1 - Orca SOL/USDC',
        startDate: '2024-09-08',
        endDate: '2024-09-11',
        rangeFrom: -20,
        rangeTo: 30,
        principal: 4177,
        earnings: 10.3
    });

    const [calculations, setCalculations] = useState<Calculations>({
        days: 0,
        earningPerDay: 0,
        apr: 0
    });

    useEffect(() => {
        calculateMetrics();
    }, [formData]);

    const calculateMetrics = (): void => {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const timeDiff = end.getTime() - start.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const earningPerDay = days > 0 ? formData.earnings / days : 0;
        const dailyReturn = formData.principal > 0 ? earningPerDay / formData.principal : 0;
        const apr = dailyReturn * 365 * 100;

        setCalculations({
            days: Math.max(0, days),
            earningPerDay: earningPerDay,
            apr: apr
        });
    };

    const isNumericField = (field: FormField): field is NumericField => {
        return ['rangeFrom', 'rangeTo', 'principal', 'earnings'].includes(field as NumericField);
    };

    const handleInputChange = (field: FormField, value: string): void => {
        setFormData(prev => ({
            ...prev,
            [field]: isNumericField(field) ? parseFloat(value) || 0 : value
        }));
    };

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    const formatPercent = (value: number): string => {
        return `${value.toFixed(2)}%`;
    };

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
                    <p className="text-gray-600">Calculate your LP earnings, APR, and daily returns</p>
                </div>

                <div className="max-w-2xl mx-auto">
                    {/* Input Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-indigo-600" />
                            Liquidity Pool Calculator
                        </h2>

                        <div className="space-y-4">
                            {/* Pool Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pool Name</label>
                                <input
                                    type="text"
                                    value={formData.poolName}
                                    onChange={(e) => handleInputChange('poolName', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="LP1 - Orca SOL/USDC"
                                />
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.rangeFrom}
                                            onChange={(e) => handleInputChange('rangeFrom', e.target.value)}
                                            className="w-full px-4 py-3 pr-8 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="From"
                                        />
                                        <span className="absolute right-3 top-3 text-gray-500">%</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.rangeTo}
                                            onChange={(e) => handleInputChange('rangeTo', e.target.value)}
                                            className="w-full px-4 py-3 pr-8 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            placeholder="To"
                                        />
                                        <span className="absolute right-3 top-3 text-gray-500">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Principal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Principal Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={formData.principal}
                                        onChange={(e) => handleInputChange('principal', e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="4177"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            {/* Earnings */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Earnings</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={formData.earnings}
                                        onChange={(e) => handleInputChange('earnings', e.target.value)}
                                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholder="10.3"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            {/* Calculated Results */}
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
                                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium">
                                        {calculations.days}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Earning per day</label>
                                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium">
                                        {formatCurrency(calculations.earningPerDay)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">APR</label>
                                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium">
                                        {formatPercent(calculations.apr)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiquidityPoolsTrackerPage;
