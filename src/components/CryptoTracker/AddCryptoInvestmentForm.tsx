import React, { useEffect } from 'react';
import { X, TrendingUp } from "lucide-react";
import {InvestmentFormData} from "@/app/page";
import { Investment } from '@/react-query/useInvestments';

interface AddCryptoInvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: InvestmentFormData;
    setFormData: React.Dispatch<React.SetStateAction<InvestmentFormData>>;
    handleSubmit: () => void;
    loading: boolean;
    editingInvestment: Investment | null;
    setEditingInvestment: React.Dispatch<React.SetStateAction<Investment | null>>;
}

export const AddCryptoInvestmentForm: React.FC<AddCryptoInvestmentModalProps> = ({
                                                                                     isOpen,
                                                                                     onClose,
                                                                                     formData,
                                                                                     setFormData,
                                                                                     handleSubmit,
                                                                                     loading,
                                                                                     editingInvestment,
                                                                                     setEditingInvestment,
                                                                                 }) => {
    const handleCancel = () => {
        if (editingInvestment) {
            setEditingInvestment(null);
            setFormData({
                tokenName: '',
                symbol: '',
                quantity: '',
                purchasePrice: '',
                amountPaid: '',
                dateAdded: '',
                status: 'open',
                sold: '',
                closePrice: '',
                closedAt: '',
                notes: '',
            });
        }
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 rounded-t-2xl flex justify-between items-center">
                    <h2 className="text-2xl font-semibold flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
                    </h2>
                    <button
                        onClick={handleCancel}
                        className="cursor-pointer p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400 hover:text-white" />
                    </button>

                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Date of Purchase</label>
                            <input
                                type="date"
                                value={formData.dateAdded}
                                onChange={(e) => setFormData({ ...formData, dateAdded: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Token Name*</label>
                            <input
                                type="text"
                                value={formData.tokenName}
                                onChange={(e) => setFormData({ ...formData, tokenName: e.target.value })}
                                placeholder="e.g., Bitcoin"
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Symbol (CoinGecko ID)*</label>
                            <input
                                type="text"
                                value={formData.symbol}
                                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                                placeholder="e.g., bitcoin"
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Quantity*</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="0.00"
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Purchase Price*</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.purchasePrice}
                                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                                placeholder="0.00"
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Amount Paid (optional)</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.amountPaid}
                                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                                placeholder="Auto-calculated"
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Sold (%)</label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                max="100"
                                value={formData.sold || ''}
                                onChange={(e) => setFormData({ ...formData, sold: e.target.value })}
                                placeholder="e.g., 25"
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Close Price</label>
                            <input
                                type="number"
                                step="any"
                                value={formData.closePrice || ''}
                                onChange={(e) => setFormData({ ...formData, closePrice: e.target.value })}
                                placeholder="0.00"
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Closed At</label>
                            <input
                                type="date"
                                value={formData.closedAt || ''}
                                onChange={(e) => setFormData({ ...formData, closedAt: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div className="flex flex-col col-span-full">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Add any additional notes about this investment..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-green-500 resize-vertical"
                            />
                        </div>
                    </div>

                    <div className="text-slate-400 text-xs">
                        * Use CoinGecko IDs for symbols (e.g., bitcoin, ethereum). Check coingecko.com for
                        exact IDs.
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-slate-700">
                        <button
                            onClick={handleCancel}
                            className="cursor-pointer flex-1 px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="cursor-pointer flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? "Processing..." : (editingInvestment ? 'Update Investment' : 'Add Investment')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
