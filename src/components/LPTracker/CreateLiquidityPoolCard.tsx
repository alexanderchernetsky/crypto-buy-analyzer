import React, { useState } from "react";
import { DollarSign, X, Plus } from "lucide-react";
import { useAddPool } from "@/react-query/useLiquidityPools";
import {EarningRow} from "@/types/liquidity-pools";

export type NewPoolFormData = Omit<FormData, "id">;

export interface FormData {
    id: string;
    poolName: string;
    tokenSymbol: string;
    rangeFrom: number;
    rangeTo: number;
    status: "open" | "closed";
    earningRows: EarningRow[];
    comments?: string;
}

interface AddLiquidityPoolModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddLiquidityPoolModal: React.FC<AddLiquidityPoolModalProps> = ({
                                                                         isOpen,
                                                                         onClose,
                                                                     }) => {
    const { mutateAsync: addPool, isPending } = useAddPool();

    const [formData, setFormData] = useState<NewPoolFormData>({
        poolName: "",
        tokenSymbol: "",
        rangeFrom: 0,
        rangeTo: 0,
        status: "open",
        earningRows: [
            {
                id: `row_${Date.now()}`,
                startDate: "",
                endDate: "",
                earnings: 0,
                gathered: "no",
                principal: 1000,
            },
        ],
        comments: "",
    });

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]:
                ["rangeFrom", "rangeTo"].includes(field)
                    ? parseFloat(value) || 0
                    : value,
        }));
    };

    const addEarningRow = () => {
        const newRow: EarningRow = {
            id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startDate: "",
            endDate: "",
            earnings: 0,
            gathered: "no",
            principal: 1000, // Default principal
        };

        setFormData((prev) => ({
            ...prev,
            earningRows: [...prev.earningRows, newRow],
        }));
    };

    const removeEarningRow = (rowId: string) => {
        setFormData((prev) => ({
            ...prev,
            earningRows: prev.earningRows.filter((row) => row.id !== rowId),
        }));
    };

    const updateEarningRow = (rowId: string, field: keyof EarningRow, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            earningRows: prev.earningRows.map((row) =>
                row.id === rowId
                    ? {
                        ...row,
                        [field]: field === "earnings" || field === "principal"
                            ? parseFloat(value.toString()) || 0
                            : value,
                    }
                    : row
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addPool(formData);
        // reset form after submission
        setFormData({
            poolName: "",
            tokenSymbol: "",
            rangeFrom: 0,
            rangeTo: 0,
            status: "open",
            earningRows: [
                {
                    id: `row_${Date.now()}`,
                    startDate: "",
                    endDate: "",
                    earnings: 0,
                    gathered: "no",
                    principal: 1000,
                },
            ],
            comments: "",
        });
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            Create New Liquidity Pool
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleChange("status", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        {/* Pool Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pool Name
                            </label>
                            <input
                                type="text"
                                value={formData.poolName}
                                onChange={(e) => handleChange("poolName", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="LP1 - Orca SOL/USDC"
                                required
                            />
                        </div>

                        {/* Token Symbol */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Token Symbol</label>
                            <input
                                type="text"
                                value={formData.tokenSymbol || ""}
                                onChange={(e) => handleChange("tokenSymbol", e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="e.g., ethereum, solana, etc."
                                required
                            />
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price Range
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="1"
                                        value={formData.rangeFrom}
                                        onChange={(e) => handleChange("rangeFrom", e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="From price"
                                        required
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                        Min
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="1"
                                        value={formData.rangeTo}
                                        onChange={(e) => handleChange("rangeTo", e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="To price"
                                        required
                                    />
                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                        Max
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Earning Periods */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-medium text-gray-700">Earning Periods</label>
                                <button
                                    type="button"
                                    onClick={addEarningRow}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Period
                                </button>
                            </div>

                            <div className="space-y-3">
                                {formData.earningRows.map((row) => (
                                    <div
                                        key={row.id}
                                        className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={row.startDate}
                                                onChange={(e) => updateEarningRow(row.id, "startDate", e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                                            <input
                                                type="date"
                                                value={row.endDate}
                                                onChange={(e) => updateEarningRow(row.id, "endDate", e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Principal</label>
                                            <input
                                                type="number"
                                                value={row.principal}
                                                onChange={(e) => updateEarningRow(row.id, "principal", e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                placeholder="Principal"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Earnings</label>
                                            <input
                                                type="number"
                                                value={row.earnings}
                                                onChange={(e) => updateEarningRow(row.id, "earnings", e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Gathered</label>
                                            <select
                                                value={row.gathered}
                                                onChange={(e) => updateEarningRow(row.id, "gathered", e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                            >
                                                <option value="no">No</option>
                                                <option value="yes">Yes</option>
                                            </select>
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => removeEarningRow(row.id)}
                                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                                                title="Remove this row"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Comments */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                            <textarea
                                value={formData.comments || ""}
                                onChange={(e) => handleChange("comments", e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-vertical"
                                placeholder="Optional notes about this pool..."
                            />
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-8 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </span>
                            ) : (
                                "Create Pool"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLiquidityPoolModal;
