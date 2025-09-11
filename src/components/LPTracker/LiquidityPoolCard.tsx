import React, { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";
import {useUpdatePool} from "@/react-query/useLiquidityPools";
import {FormData} from "@/components/LPTracker/CreateLiquidityPoolCard";

interface Calculations {
    days: number;
    earningPerDay: number;
    apr: number;
}

type FormField = keyof FormData;
type NumericField = "rangeFrom" | "rangeTo" | "principal" | "earnings";

const LiquidityPoolCard: React.FC<{ initialData: FormData }> = ({ initialData }) => {
    const [formData, setFormData] = useState<FormData>(initialData);
    const [calculations, setCalculations] = useState<Calculations>({
        days: 0,
        earningPerDay: 0,
        apr: 0,
    });

    const { mutate: updatePool, isPending: isSaving } = useUpdatePool();

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
            apr: apr,
        });
    };

    const isNumericField = (field: FormField): field is NumericField => {
        return ["rangeFrom", "rangeTo", "principal", "earnings"].includes(field as NumericField);
    };

    const handleInputChange = (field: FormField, value: string): void => {
        setFormData((prev) => ({
            ...prev,
            [field]: isNumericField(field) ? parseFloat(value) || 0 : value,
        }));
    };

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
        }).format(value);
    };

    const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

    const isDisabled = formData.status === "closed" || isSaving;

    const handleSave = () => {
        updatePool(formData);
    };

    return (
        <div
            className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 transition-opacity ${
                formData.status === "closed" ? "opacity-50 pointer-events-none" : ""
            }`}
        >
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                Liquidity Pool Calculator
            </h2>

            <div className="space-y-4">
                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => handleInputChange("status", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        disabled={isSaving}
                    >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                {/* Pool Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pool Name</label>
                    <input
                        type="text"
                        value={formData.poolName}
                        onChange={(e) => handleInputChange("poolName", e.target.value)}
                        disabled={isDisabled}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleInputChange("startDate", e.target.value)}
                            disabled={isDisabled}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleInputChange("endDate", e.target.value)}
                            disabled={isDisabled}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                        />
                    </div>
                </div>

                {/* Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            value={formData.rangeFrom}
                            onChange={(e) => handleInputChange("rangeFrom", e.target.value)}
                            disabled={isDisabled}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                            placeholder="From"
                        />
                        <input
                            type="number"
                            value={formData.rangeTo}
                            onChange={(e) => handleInputChange("rangeTo", e.target.value)}
                            disabled={isDisabled}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                            placeholder="To"
                        />
                    </div>
                </div>

                {/* Principal */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Principal Amount</label>
                    <input
                        type="number"
                        value={formData.principal}
                        onChange={(e) => handleInputChange("principal", e.target.value)}
                        disabled={isDisabled}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    />
                </div>

                {/* Earnings */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total Earnings</label>
                    <input
                        type="number"
                        value={formData.earnings}
                        onChange={(e) => handleInputChange("earnings", e.target.value)}
                        disabled={isDisabled}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    />
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

                {/* Save Button */}
                {!isDisabled && (
                    <div className="mt-6">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiquidityPoolCard;
