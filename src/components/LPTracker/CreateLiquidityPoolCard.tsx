import React, { useState } from "react";
import { DollarSign, X } from "lucide-react";
import {useAddPool} from "@/react-query/useLiquidityPools";

export interface FormData {
    poolName: string;
    startDate: string;
    endDate: string;
    rangeFrom: number;
    rangeTo: number;
    principal: number;
    earnings: number;
    status: "open" | "closed";
}

interface AddLiquidityPoolModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddLiquidityPoolModal: React.FC<AddLiquidityPoolModalProps> = ({ isOpen, onClose }) => {
    const { mutateAsync: addPool, isPending } = useAddPool();

    const [formData, setFormData] = useState<FormData>({
        poolName: "",
        startDate: "",
        endDate: "",
        rangeFrom: 0,
        rangeTo: 0,
        principal: 0,
        earnings: 0,
        status: "open",
    });

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]:
                ["rangeFrom", "rangeTo", "principal", "earnings"].includes(field)
                    ? parseFloat(value) || 0
                    : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addPool(formData);
        // reset form after submission
        setFormData({
            poolName: "",
            startDate: "",
            endDate: "",
            rangeFrom: 0,
            rangeTo: 0,
            principal: 0,
            earnings: 0,
            status: "open",
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
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
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

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleChange("startDate", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleChange("endDate", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                />
                            </div>
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

                        {/* Financial Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Principal Amount
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="1"
                                        min="1"
                                        value={formData.principal}
                                        onChange={(e) => handleChange("principal", e.target.value)}
                                        className="w-full px-4 py-3 pl-8 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="4177"
                                        required
                                    />
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Earnings
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="1"
                                        value={formData.earnings}
                                        onChange={(e) => handleChange("earnings", e.target.value)}
                                        className="w-full px-4 py-3 pl-8 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="10.3"
                                    />
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
                                </div>
                            </div>
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
