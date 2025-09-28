import React, { useEffect, useState } from "react";
import { DollarSign, Trash2, Plus, X } from "lucide-react";
import { useUpdatePool, useRemovePool } from "@/react-query/useLiquidityPools";
import { FormData } from "@/components/LPTracker/CreateLiquidityPoolCard";
import formatCurrency from "@/utils/formatCurrency";
import { calculateLiquidityPoolMetricsWithValidation } from "@/utils/calculateLiquidityPoolMetrics";
import { formatPercentage } from "@/utils/formatPercentage";
import { Calculations, EarningRow } from "@/types/liquidity-pools";

type FormField = keyof FormData;
type NumericField = "rangeFrom" | "rangeTo" | "entryPrice";

const LiquidityPoolCard: React.FC<{ initialData: FormData, price: number }> = ({ initialData, price }) => {
    const [showComments, setShowComments] = useState(false);
    const [formData, setFormData] = useState<FormData>(initialData);
    const [calculations, setCalculations] = useState<Calculations>({
        days: 0,
        earningPerDay: 0,
        apr: 0,
    });

    const { mutate: updatePool, isPending: isSaving } = useUpdatePool();
    const { mutate: removePool, isPending: isDeleting } = useRemovePool();

    useEffect(() => {
        const metrics = calculateLiquidityPoolMetricsWithValidation({
            earningRows: formData.earningRows,
        });
        setCalculations(metrics);
    }, [formData]);

    const isNumericField = (field: FormField): field is NumericField => {
        return ["rangeFrom", "rangeTo", "entryPrice"].includes(field as NumericField);
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
            startDate: "",
            endDate: "",
            earnings: 0,
            gathered: "no",
            principal: 0,
        };

        setFormData((prev) => ({
            ...prev,
            earningRows: [...prev.earningRows, newRow],
        }));
    };

    const removeEarningRow = (rowId: string): void => {
        setFormData((prev) => ({
            ...prev,
            earningRows: prev.earningRows.filter((row) => row.id !== rowId),
        }));
    };

    const updateEarningRow = (
        rowId: string,
        field: keyof EarningRow,
        value: string | number
    ): void => {
        setFormData((prev) => ({
            ...prev,
            earningRows: prev.earningRows.map((row) =>
                row.id === rowId
                    ? {
                        ...row,
                        [field]:
                            field === "earnings" || field === "principal"
                                ? parseFloat(value.toString()) || 0
                                : value,
                    }
                    : row
            ),
        }));
    };

    const wasOriginallyClosed = initialData.status === "closed";
    const isFormDisabled = wasOriginallyClosed || isSaving || isDeleting;
    const areButtonsDisabled = isSaving || isDeleting;

    const handleSave = () => {
        updatePool(formData);
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this liquidity pool?")) {
            removePool(formData.id);
        }
    };

    return (
        <div
            className={`bg-slate-800/90 rounded-xl border border-slate-700 shadow-lg p-6 mb-8 transition-opacity ${
                formData.status === "closed" ? "opacity-75" : ""
            }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-500" />
                    Liquidity Pool Position
                </h2>
                {formData.status === "closed" && (
                    <span className="px-3 py-1 bg-slate-700 text-slate-200 text-sm font-semibold rounded-md">
            Closed
          </span>
                )}
            </div>

            <div className="space-y-4">
                {/* Status, Pool Name, Token Symbol */}
                <div className="flex gap-4 mb-4">
                    {/* Status */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleInputChange("status", e.target.value)}
                            className="w-full px-3 py-2 border border-slate-600 bg-slate-900/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-slate-800 disabled:text-slate-400"
                            disabled={areButtonsDisabled}
                        >
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    {/* Pool Name */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Pool Name
                        </label>
                        <input
                            type="text"
                            value={formData.poolName}
                            onChange={(e) => handleInputChange("poolName", e.target.value)}
                            disabled={isFormDisabled}
                            className="w-full px-3 py-2 border border-slate-600 bg-slate-900/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-slate-800 disabled:text-slate-400"
                        />
                    </div>

                    {/* Token Symbol */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                            Token Symbol
                        </label>
                        <input
                            type="text"
                            value={formData.tokenSymbol || ""}
                            onChange={(e) => handleInputChange("tokenSymbol", e.target.value)}
                            disabled={isFormDisabled}
                            className="w-full px-3 py-2 border border-slate-600 bg-slate-900/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-slate-800 disabled:text-slate-400"
                            placeholder="e.g., ETH, SOL"
                            required
                        />
                    </div>
                </div>

                {/* Price Range */}
                <div className="flex flex-col gap-2 mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                        Price Range
                    </label>

                    <div className="flex items-center gap-4">
                        <div className="text-slate-200">{formData.rangeFrom}</div>

                        <div className="flex-1 relative h-4 bg-slate-700 rounded-full">
                            <div
                                className="absolute top-0 -translate-x-1/2 h-4 w-1.5 rounded bg-red-400 shadow z-10"
                                style={{
                                    left: `${Math.max(
                                        0,
                                        Math.min(
                                            100,
                                            ((price - formData.rangeFrom) /
                                                (formData.rangeTo - formData.rangeFrom)) *
                                            100
                                        )
                                    )}%`,
                                }}
                                title={`Current Price: ${price}`}
                            ></div>

                            {formData.entryPrice && formData.entryPrice > 0 && (
                                <div
                                    className="absolute top-0 -translate-x-1/2 h-4 w-1.5 rounded bg-blue-400 shadow z-10"
                                    style={{
                                        left: `${Math.max(
                                            0,
                                            Math.min(
                                                100,
                                                ((formData.entryPrice - formData.rangeFrom) /
                                                    (formData.rangeTo - formData.rangeFrom)) *
                                                100
                                            )
                                        )}%`,
                                    }}
                                    title={`Entry Price: ${formData.entryPrice}`}
                                ></div>
                            )}
                        </div>

                        <div className="text-slate-200">{formData.rangeTo}</div>

                        <span
                            className={`px-3 py-1 text-sm font-semibold rounded-md ${
                                price >= formData.rangeFrom && price <= formData.rangeTo
                                    ? "bg-emerald-600/20 text-emerald-400"
                                    : "bg-red-600/20 text-red-400"
                            }`}
                        >
              {price >= formData.rangeFrom && price <= formData.rangeTo
                  ? `Within range`
                  : `Outside range`}
            </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-400 rounded"></div>
                            <span>Current Price ({price})</span>
                        </div>
                        {formData.entryPrice && formData.entryPrice > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                                <span>Entry Price ({formData.entryPrice})</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Earning Rows */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-slate-300">
                            Earning Periods
                        </label>
                        <button
                            type="button"
                            onClick={addEarningRow}
                            disabled={isFormDisabled}
                            className="cursor-pointer flex items-center gap-1 px-3 py-1 text-sm bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 transition-all disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                            Add Row
                        </button>
                    </div>

                    {formData.earningRows.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <p>No earning periods added yet.</p>
                            <button
                                type="button"
                                onClick={addEarningRow}
                                disabled={isFormDisabled}
                                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50"
                            >
                                Add First Period
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {formData.earningRows.map((row) => (
                                <div
                                    key={row.id}
                                    className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-900/70 border border-slate-700 rounded-lg"
                                >
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-400 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={row.startDate}
                                            onChange={(e) =>
                                                updateEarningRow(row.id, "startDate", e.target.value)
                                            }
                                            disabled={isFormDisabled}
                                            className="w-full px-3 py-2 text-sm border border-slate-600 bg-slate-800/80 text-slate-100 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-slate-700 disabled:text-slate-400"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-400 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={row.endDate}
                                            onChange={(e) =>
                                                updateEarningRow(row.id, "endDate", e.target.value)
                                            }
                                            disabled={isFormDisabled}
                                            className="w-full px-3 py-2 text-sm border border-slate-600 bg-slate-800/80 text-slate-100 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-slate-700 disabled:text-slate-400"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-400 mb-1">
                                            Principal
                                        </label>
                                        <input
                                            type="number"
                                            value={row.principal || 0}
                                            onChange={(e) =>
                                                updateEarningRow(row.id, "principal", e.target.value)
                                            }
                                            disabled={isFormDisabled}
                                            className="w-full px-3 py-2 text-sm border border-slate-600 bg-slate-800/80 text-slate-100 font-mono rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-slate-700 disabled:text-slate-400"
                                            placeholder="Principal"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="block text-xs font-medium text-slate-400 mb-1">
                                            Earnings
                                        </label>
                                        <input
                                            type="number"
                                            value={row.earnings}
                                            onChange={(e) =>
                                                updateEarningRow(row.id, "earnings", e.target.value)
                                            }
                                            disabled={isFormDisabled}
                                            className="w-full px-3 py-2 text-sm border border-slate-600 bg-slate-800/80 text-slate-100 font-mono rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-slate-700 disabled:text-slate-400"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-slate-400 mb-1">
                                            Gathered
                                        </label>
                                        <select
                                            value={row.gathered}
                                            onChange={(e) =>
                                                updateEarningRow(row.id, "gathered", e.target.value)
                                            }
                                            disabled={isFormDisabled}
                                            className="w-full px-3 py-2 text-sm border border-slate-600 bg-slate-800/80 text-slate-100 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:bg-slate-700 disabled:text-slate-400"
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
                                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded transition-all disabled:opacity-50"
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

                {/* Calculated Results */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Total Days
                        </label>
                        <div className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-100 font-mono">
                            {calculations.days}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Earning per day
                        </label>
                        <div className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-100 font-mono">
                            {formatCurrency(calculations.earningPerDay)}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            APR
                        </label>
                        <div
                            className={`w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-lg font-mono font-semibold ${
                                calculations.apr >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                        >
                            {formatPercentage(calculations.apr)}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center mt-6">
                    <button
                        type="button"
                        onClick={() => setShowComments(!showComments)}
                        className="cursor-pointer px-6 py-3 bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 transition disabled:opacity-50"
                    >
                        {showComments ? "Hide Comments" : "Show Comments"}
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={areButtonsDisabled}
                            className="cursor-pointer px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                            onClick={handleDelete}
                            disabled={areButtonsDisabled}
                            className="cursor-pointer flex items-center gap-2 px-6 py-3 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-all disabled:opacity-50 border border-red-600/30 hover:border-red-500/50"
                        >
                            <Trash2 className="w-4 h-4" />
                            {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="mt-6 p-4 bg-slate-900/80 border border-slate-700 rounded-lg">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Comments
                        </label>
                        <textarea
                            value={formData.comments}
                            onChange={(e) => handleInputChange("comments", e.target.value)}
                            disabled={isFormDisabled}
                            className="w-full px-4 py-3 border border-slate-600 bg-slate-800/80 text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:bg-slate-700 disabled:text-slate-400"
                            rows={3}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiquidityPoolCard;
