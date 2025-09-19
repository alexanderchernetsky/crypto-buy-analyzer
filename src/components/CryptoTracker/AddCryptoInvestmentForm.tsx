import React from 'react';
import {InvestmentFormData} from "@/app/page";
import { Investment } from '@/react-query/useInvestments';

export const AddCryptoInvestmentForm = ({
    formData,
    setFormData,
    handleSubmit,
    loading,
    editingInvestment,
    setShowAddForm,
    setEditingInvestment,
}: {
    formData: InvestmentFormData;
    setFormData: React.Dispatch<React.SetStateAction<InvestmentFormData>>;
    handleSubmit: () => void;
    loading: boolean;
    editingInvestment: Investment | null;
    setShowAddForm: React.Dispatch<React.SetStateAction<boolean>>;
    setEditingInvestment: React.Dispatch<React.SetStateAction<Investment | null>>;
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
                notes: '',
            });
        }
        setShowAddForm(false);
    };

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
            <h2 className="text-white mb-5 text-lg font-bold">
                {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
            </h2>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-5">
                <div className="flex flex-col">
                    <label className="text-slate-300 text-sm mb-2">Date of Purchase</label>
                    <input
                        type="date"
                        value={formData.dateAdded}
                        onChange={(e) => setFormData({ ...formData, dateAdded: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-inherit"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-slate-300 text-sm mb-2">Token Name*</label>
                    <input
                        type="text"
                        value={formData.tokenName}
                        onChange={(e) => setFormData({ ...formData, tokenName: e.target.value })}
                        placeholder="e.g., Bitcoin"
                        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-inherit"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-slate-300 text-sm mb-2">Symbol (CoinGecko ID)*</label>
                    <input
                        type="text"
                        value={formData.symbol}
                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                        placeholder="e.g., bitcoin"
                        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-inherit"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-slate-300 text-sm mb-2">Quantity*</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="0.00"
                        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-inherit"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-slate-300 text-sm mb-2">Purchase Price*</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                        placeholder="0.00"
                        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-inherit"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-slate-300 text-sm mb-2">Amount Paid (optional)</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.amountPaid}
                        onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                        placeholder="Auto-calculated"
                        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-inherit"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-slate-300 text-sm mb-2">Sold (%)</label>
                    <input
                        type="number"
                        step="any"
                        min="0"
                        max="100"
                        value={formData.sold || ''}
                        onChange={(e) => setFormData({ ...formData, sold: e.target.value })}
                        placeholder="e.g., 25"
                        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-inherit"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-slate-300 text-sm mb-2">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-inherit"
                    >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-slate-300 text-sm mb-2">Close Price</label>
                    <input
                        type="number"
                        step="any"
                        value={formData.closePrice || ''}
                        onChange={(e) => setFormData({ ...formData, closePrice: e.target.value })}
                        placeholder="0.00"
                        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-inherit"
                    />
                </div>

                <div className="flex flex-col col-span-full">
                    <label className="text-slate-300 text-sm mb-2">Notes</label>
                    <textarea
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any additional notes about this investment..."
                        rows={3}
                        className="bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-inherit min-h-[80px] resize-y"
                    />
                </div>
            </div>

            <div className="flex gap-3 flex-wrap">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium transition-all duration-200 ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {editingInvestment ? 'Update Investment' : 'Add Investment'}
                </button>
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-medium bg-slate-600 hover:bg-slate-700"
                >
                    Cancel
                </button>
            </div>

            <p className="text-slate-400 text-xs mt-2">
                * Use CoinGecko IDs for symbols (e.g., bitcoin, ethereum). Check coingecko.com for
                exact IDs.
            </p>
        </div>
    );
};
