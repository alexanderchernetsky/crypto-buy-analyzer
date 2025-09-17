import React, { useEffect, useState } from "react";
import { DollarSign, Trash2, Plus, X } from "lucide-react";
import {useUpdatePool, useRemovePool} from "@/react-query/useLiquidityPools";
import {FormData} from "@/components/LPTracker/CreateLiquidityPoolCard";
import formatCurrency from "@/utils/formatCurrency";

interface EarningRow {
    id: string;
    startDate: string;
    endDate: string;
    earnings: number;
    gathered: 'yes' | 'no';
}

interface Calculations {
    days: number;
    earningPerDay: number;
    apr: number;
}

type FormField = keyof FormData;
type NumericField = "rangeFrom" | "rangeTo" | "principal";

interface ModifiedFormData extends Omit<FormData, 'startDate' | 'endDate' | 'earnings'> {
    earningRows: EarningRow[];
}

interface InitialData extends Partial<ModifiedFormData> {
    id: string;
    // Support for legacy data structure
    startDate?: string;
    endDate?: string;
    earnings?: number;
}

const LiquidityPoolCard: React.FC<{ initialData: InitialData }> = ({ initialData }) => {
    // Migrate old data structure to new structure if needed
    const migrateInitialData = (data: any): InitialData => {
        // If earningRows already exists, use as is
        if (data.earningRows && Array.isArray(data.earningRows)) {
            return data as InitialData;
        }

        // Migrate from old structure to new structure
        const earningRows: EarningRow[] = [];

        // If we have old format data (startDate, endDate, earnings), create a row from it
        if (data.startDate || data.endDate || (data.earnings && data.earnings > 0)) {
            earningRows.push({
                id: `migrated_${Date.now()}`,
                startDate: data.startDate || '',
                endDate: data.endDate || '',
                earnings: data.earnings || 0,
                gathered: 'no'
            });
        }

        // Remove old fields and add new structure
        const { startDate, endDate, earnings, ...restData } = data;

        return {
            ...restData,
            earningRows
        };
    };

    const [formData, setFormData] = useState<InitialData>(() => migrateInitialData(initialData));
    const [calculations, setCalculations] = useState<Calculations>({
        days: 0,
        earningPerDay: 0,
        apr: 0,
    });

    const { mutate: updatePool, isPending: isSaving } = useUpdatePool();
    const { mutate: removePool, isPending: isDeleting } = useRemovePool();

    useEffect(() => {
        calculateMetrics();
    }, [formData]);

    const calculateMetrics = (): void => {
        if (formData.earningRows.length === 0) {
            setCalculations({ days: 0, earningPerDay: 0, apr: 0 });
            return;
        }

        // Calculate total days and earnings across all rows
        let totalDays = 0;
        let totalEarnings = 0;

        formData.earningRows.forEach(row => {
            if (row.startDate && row.endDate) {
                const start = new Date(row.startDate);
                const end = new Date(row.endDate);
                const timeDiff = end.getTime() - start.getTime();
                const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
                totalDays += Math.max(0, days);
            }
            totalEarnings += row.earnings;
        });

        const earningPerDay = totalDays > 0 ? totalEarnings / totalDays : 0;
        const dailyReturn = formData.principal > 0 ? earningPerDay / formData.principal : 0;
        const apr = dailyReturn * 365 * 100;

        setCalculations({
            days: totalDays,
            earningPerDay: earningPerDay,
            apr: apr,
        });
    };

    const isNumericField = (field: FormField): field is NumericField => {
        return ["rangeFrom", "rangeTo", "principal"].includes(field as NumericField);
    };

    const handleInputChange = (field: FormField, value: string): void => {
        setFormData((prev) => ({
            ...prev,
            [field]: isNumericField(field) ? parseFloat(value) || 0 : value,
        }));
    };

    const addEarningRow = (): void => {
        const newRow: EarningRow = {
            id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startDate: '',
            endDate: '',
            earnings: 0,
            gathered: 'no'
        };

        setFormData(prev => ({
            ...prev,
            earningRows: [...prev.earningRows, newRow]
        }));
    };

    const removeEarningRow = (rowId: string): void => {
        setFormData(prev => ({
            ...prev,
            earningRows: prev.earningRows.filter(row => row.id !== rowId)
        }));
    };

    const updateEarningRow = (rowId: string, field: keyof EarningRow, value: string | number): void => {
        setFormData(prev => ({
            ...prev,
            earningRows: prev.earningRows.map(row =>
                row.id === rowId
                    ? {
                        ...row,
                        [field]: field === 'earnings' ? (parseFloat(value.toString()) || 0) : value
                    }
                    : row
            )
        }));
    };

    const formatPercent = (value: number): string => `${value.toFixed(2)}%`;

    // Check if the pool was originally closed (to disable editing of other fields)
    const wasOriginallyClosed = initialData.status === "closed";

    // Disable form fields if originally closed, but allow status changes and saving
    const isFormDisabled = wasOriginallyClosed || isSaving || isDeleting;

    // Only disable buttons during API operations
    const areButtonsDisabled = isSaving || isDeleting;

    const handleSave = () => {
        updatePool(formData);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this liquidity pool?')) {
            removePool(formData.id);
        }
    };

    return (
        <div
            className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 transition-opacity ${
                formData.status === "closed" ? "opacity-75" : ""
            }`}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    Liquidity Pool Calculator
                </h2>
                {formData.status === "closed" && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                        Closed
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => handleInputChange("status", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                        disabled={areButtonsDisabled}
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
                        disabled={isFormDisabled}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    />
                </div>

                {/* Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            value={formData.rangeFrom}
                            onChange={(e) => handleInputChange("rangeFrom", e.target.value)}
                            disabled={isFormDisabled}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                            placeholder="From"
                        />
                        <input
                            type="number"
                            value={formData.rangeTo}
                            onChange={(e) => handleInputChange("rangeTo", e.target.value)}
                            disabled={isFormDisabled}
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
                        disabled={isFormDisabled}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    />
                </div>

                {/* Earning Rows */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">Earning Periods</label>
                        <button
                            type="button"
                            onClick={addEarningRow}
                            disabled={isFormDisabled}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            Add Row
                        </button>
                    </div>

                    {formData.earningRows.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No earning periods added yet.</p>
                            <button
                                type="button"
                                onClick={addEarningRow}
                                disabled={isFormDisabled}
                                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                            >
                                Add First Period
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {formData.earningRows.map((row, index) => (
                                <div key={row.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="col-span-3">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={row.startDate}
                                            onChange={(e) => updateEarningRow(row.id, 'startDate', e.target.value)}
                                            disabled={isFormDisabled}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={row.endDate}
                                            onChange={(e) => updateEarningRow(row.id, 'endDate', e.target.value)}
                                            disabled={isFormDisabled}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Earnings</label>
                                        <input
                                            type="number"
                                            value={row.earnings}
                                            onChange={(e) => updateEarningRow(row.id, 'earnings', e.target.value)}
                                            disabled={isFormDisabled}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Gathered</label>
                                        <select
                                            value={row.gathered}
                                            onChange={(e) => updateEarningRow(row.id, 'gathered', e.target.value)}
                                            disabled={isFormDisabled}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100"
                                        >
                                            <option value="no">No</option>
                                            <option value="yes">Yes</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeEarningRow(row.id)}
                                            disabled={isFormDisabled}
                                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all disabled:opacity-50"
                                            title="Remove this row"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Comments */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                    <textarea
                        value={formData.comments || ""}
                        onChange={(e) => handleInputChange("comments", e.target.value)}
                        disabled={isFormDisabled}
                        rows={2}
                        placeholder=""
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 resize-vertical"
                    />
                </div>

                {/* Calculated Results */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Days</label>
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

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6">
                    <button
                        onClick={handleSave}
                        disabled={areButtonsDisabled}
                        className="cursor-pointer px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={areButtonsDisabled}
                        className="cursor-pointer flex items-center gap-2 px-6 py-3  text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 border border-red-200 hover:border-red-300"
                        title="Delete Pool"
                    >
                        <Trash2 className="w-4 h-4" />
                        {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LiquidityPoolCard;
