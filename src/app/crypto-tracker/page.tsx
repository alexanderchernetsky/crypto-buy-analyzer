'use client'
import React, { useEffect, useState } from 'react';
import { DollarSign, RefreshCw, Plus, Pencil, Trash2, Filter } from 'lucide-react';
import {
    useInvestments,
    useAddInvestment,
    useRemoveInvestment,
    useUpdateInvestment,
    Investment
} from '@/react-query/useInvestments';
import { fetchPrices } from '@/utils/api/fetchTokenPrices';
import { CryptoPortfolioSummary } from '@/components/CryptoTracker/CryptoPortfolioSummary';
import { AddCryptoInvestmentForm } from "@/components/CryptoTracker/AddCryptoInvestmentForm";
import { processCryptoTrackerData } from "@/utils/processCryptoTrackerData";

export interface InvestmentFormData {
    tokenName: string
    symbol: string
    quantity: string
    purchasePrice: string
    amountPaid: string
    dateAdded: string
    status: string
    sold: string
    closePrice: string
    notes: string
}

const CryptoTrackerPage = () => {
    const { data: investments = [] } = useInvestments();
    const addMutation = useAddInvestment();
    const removeMutation = useRemoveInvestment();
    const updateMutation = useUpdateInvestment();

    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showClosedPositions, setShowClosedPositions] = useState(false);
    const [formData, setFormData] = useState<InvestmentFormData>({
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

    // edit
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
    const [updatedInvestments, setUpdatedInvestments] = useState<Investment[]>([]);

    // sorting
    const [sortByPL, setSortByPL] = useState(false);
    const [sortPLPercentageAsc, setSortPLPercentageAsc] = useState(true);



    useEffect(() => {
        if (!investments || investments.length === 0) return;
        updatePrices();

        const interval = setInterval(updatePrices, 60000); // every 60 seconds
        return () => clearInterval(interval);
    }, [investments]);

    const updatePrices = async () => {
        if (!investments || investments.length === 0) return;
        setLoading(true);

        try {
            // Filter out closed investments for price updates
            const openInvestments = investments.filter(inv => inv.status !== 'closed');
            const closedInvestments = investments.filter(inv => inv.status === 'closed');

            let enriched: Investment[] = [];

            // Only fetch prices for open investments
            if (openInvestments.length > 0) {
                const data = await fetchPrices(openInvestments.map(i => i.symbol));

                // Update open investments with new prices
                const updatedOpenInvestments = openInvestments.map(inv => {
                    const price = data[inv.symbol]?.usd ?? inv.currentPrice ?? 0;
                    const currentValue = inv.quantity * price;
                    const profitLoss = currentValue - inv.amountPaid;
                    const profitLossPercentage = (profitLoss / inv.amountPaid) * 100;

                    return {
                        ...inv,
                        currentPrice: price,
                        currentValue,
                        profitLoss,
                        profitLossPercentage,
                        lastUpdated: new Date().toLocaleTimeString(),
                    };
                });

                enriched = [...updatedOpenInvestments];
            }

            // Keep closed investments with their existing values (no price updates)
            const preservedClosedInvestments = closedInvestments.map(inv => {
                const closePrice = inv.closePrice ?? 0;
                const quantity = inv.quantity ?? 0;
                const amountPaid = inv.amountPaid ?? 0;

                const currentValue = quantity * closePrice;
                const profitLoss = currentValue - amountPaid;
                const profitLossPercentage = (profitLoss / amountPaid) * 100;

                return {
                    ...inv,
                    currentPrice: closePrice,              // For display consistency
                    currentValue: currentValue,            // Fixed at sell time
                    profitLoss: profitLoss,
                    profitLossPercentage: profitLossPercentage,
                    // lastUpdated not needed
                };
            });


            // Combine updated open investments with preserved closed investments
            enriched = [...enriched, ...preservedClosedInvestments];

            setUpdatedInvestments(enriched);
        } catch (err) {
            console.error(err);
            alert('Error updating prices');
        } finally {
            setLoading(false);
        }
    };

    // EDIT
    const handleEdit = (investment: Investment) => {
        setFormData({
            tokenName: investment.tokenName,
            symbol: investment.symbol,
            quantity: investment.quantity.toString(),
            purchasePrice: investment.purchasePrice.toString(),
            amountPaid: investment.amountPaid.toString(),
            dateAdded: investment.dateAdded || '',
            status: investment.status || 'open',
            sold: investment.sold?.toString() || '',
            closePrice: investment.closePrice?.toString() || '',
            notes: investment.notes || '',
        });
        setEditingInvestment(investment);
        setShowAddForm(true);
    };

    // CREATE
    const handleSubmit = async () => {
        const { tokenName, symbol, quantity, purchasePrice, amountPaid } = formData;
        if (!tokenName || !symbol || !quantity || !purchasePrice) {
            return alert('Fill all required fields');
        }

        const qty = parseFloat(quantity);
        const price = parseFloat(purchasePrice);
        const paid = amountPaid ? parseFloat(amountPaid) : qty * price;
        const sold = formData.sold ? parseFloat(formData.sold) : 0;
        const closePrice = formData.closePrice ? parseFloat(formData.closePrice) : 0;

        setLoading(true);
        try {
            const data = await fetchPrices([symbol]);
            const currentPrice = data[symbol]?.usd;

            if (!currentPrice) throw new Error('Invalid symbol');

            const currentValue = qty * currentPrice;
            const profitLoss = currentValue - paid;
            const profitLossPercentage = (profitLoss / paid) * 100;

            if (editingInvestment) {
                // UPDATE
                const updated = {
                    ...editingInvestment,
                    tokenName,
                    symbol: symbol.toLowerCase(),
                    quantity: qty,
                    purchasePrice: price,
                    amountPaid: paid,
                    sold: sold,
                    closePrice: closePrice,
                    currentPrice,
                    currentValue,
                    profitLoss,
                    profitLossPercentage,
                    dateAdded: formData.dateAdded || new Date().toLocaleDateString(),
                    lastUpdated: new Date().toLocaleTimeString(),
                    status: formData.status || 'open',
                    notes: formData.notes || '',
                };

                await updateMutation.mutateAsync(updated);
            } else {
                // ADD
                const newInvestment = {
                    tokenName,
                    symbol: symbol.toLowerCase(),
                    quantity: qty,
                    purchasePrice: price,
                    amountPaid: paid,
                    sold: sold,
                    closePrice: closePrice,
                    currentPrice,
                    currentValue,
                    profitLoss,
                    profitLossPercentage,
                    dateAdded: formData.dateAdded || new Date().toLocaleDateString(),
                    lastUpdated: new Date().toLocaleTimeString(),
                    status: formData.status || 'open',
                    notes: formData.notes || '',
                };

                await addMutation.mutateAsync(newInvestment);
            }

            // clear form
            setFormData({
                tokenName: '',
                symbol: '',
                quantity: '',
                purchasePrice: '',
                sold: '',
                amountPaid: '',
                dateAdded: '',
                status: 'open',
                closePrice: '',
                notes: '',
            });
            setShowAddForm(false);
            setEditingInvestment(null);
        } catch (err) {
            alert('Could not add investment');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // DELETE
    const handleRemove = async (id: string) => {
        try {
            await removeMutation.mutateAsync(id);
        } catch (err) {
            alert('Failed to remove');
        }
    };

    const portfolio = updatedInvestments.length ? updatedInvestments : investments;

    // Filter portfolio based on showClosedPositions toggle
    const filteredPortfolio = showClosedPositions
        ? portfolio
        : portfolio.filter(investment => investment.status !== 'closed');

    const totalInvested = filteredPortfolio.reduce((sum, i) => sum + i.amountPaid, 0);
    const totalCurrentValue = filteredPortfolio.reduce((sum, i) => sum + (i.currentValue ?? 0), 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    // That's the data which is shown in the table, sorting is done here
    const processedData = React.useMemo(() => {
        const processed = processCryptoTrackerData(filteredPortfolio);
        if (!sortByPL) return processed;

        const sorted = [...processed].sort((a, b) => {
            const aVal = a.profitLossPercentage ?? 0;
            const bVal = b.profitLossPercentage ?? 0;
            return sortPLPercentageAsc ? aVal - bVal : bVal - aVal;
        });

        return sorted;
    }, [filteredPortfolio, sortByPL, sortPLPercentageAsc]);

    // Count closed positions for the filter button
    const closedPositionsCount = portfolio.filter(inv => inv.status === 'closed').length;
    const realisedProfitLoss = portfolio.filter(inv => inv.status === 'closed').reduce((sum, i) => sum + (i.currentValue - i.amountPaid), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-800 via-purple-700 to-slate-800 p-5 font-sans">
            <div className="max-w-[1500px] mx-auto">
                {/* Header */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20 shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-5">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3 m-0">
                            <DollarSign style={{ color: '#fbbf24' }} />
                            Crypto Investment Tracker
                        </h1>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={updatePrices}
                                disabled={loading || investments.length === 0}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw
                                    style={{ width: 16, height: 16 }}
                                    className={loading ? 'animate-spin' : ''}
                                />
                                Refresh Prices
                            </button>
                            <button
                                onClick={() => setShowClosedPositions(!showClosedPositions)}
                                disabled={closedPositionsCount === 0}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium ${
                                    showClosedPositions
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-gray-500 hover:bg-gray-600'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <Filter style={{ width: 16, height: 16 }} />
                                {showClosedPositions ? 'Hide' : 'Show'} Closed ({closedPositionsCount})
                            </button>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium bg-green-600 hover:bg-green-700"
                            >
                                <Plus style={{ width: 16, height: 16 }} />
                                Add Investment
                            </button>
                        </div>
                    </div>

                    {/* Portfolio Summary */}
                    <CryptoPortfolioSummary
                        totalInvested={totalInvested}
                        totalCurrentValue={totalCurrentValue}
                        totalProfitLoss={totalProfitLoss}
                        totalProfitLossPercentage={totalProfitLossPercentage}
                        realisedProfitLoss={realisedProfitLoss}
                    />
                </div>

                {/* Add Investment Form */}
                {showAddForm && (
                    <AddCryptoInvestmentForm
                        editingInvestment={editingInvestment}
                        formData={formData}
                        setFormData={setFormData}
                        loading={loading}
                        setEditingInvestment={setEditingInvestment}
                        handleSubmit={handleSubmit}
                        setShowAddForm={setShowAddForm}
                    />
                )}

                {/* Investments Table */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_10px_25px_rgba(0,0,0,0.3)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse bg-white/5 text-white">
                            <thead>
                            <tr>
                                <th className="text-sm font-semibold p-4 text-center bg-white/10 cursor-default select-none">
                                    Date of Purchase
                                </th>
                                <th className="text-sm font-semibold p-4 bg-white/10 cursor-default select-none">
                                    Token
                                </th>
                                <th className="text-sm font-semibold p-4 text-right bg-white/10 cursor-default select-none">
                                    Quantity
                                </th>
                                <th className="text-sm font-semibold p-4 text-right bg-white/10 cursor-default select-none">
                                    Purchase Price
                                </th>
                                <th className="text-sm font-semibold p-4 text-right bg-white/10 cursor-default select-none">
                                    Amount Paid
                                </th>
                                <th className="text-sm font-semibold p-4 text-right bg-white/10 cursor-default select-none">
                                    Current Price
                                </th>
                                <th className="text-sm font-semibold p-4 text-right bg-white/10 cursor-default select-none font-bold">
                                    Current Value
                                </th>
                                <th className="text-sm font-semibold p-4 text-right bg-white/10 cursor-default select-none font-bold">
                                    Profit/Loss
                                </th>
                                <th
                                    onClick={() => {
                                        if (!sortByPL) setSortByPL(true);
                                        else setSortPLPercentageAsc(prev => !prev);
                                    }}
                                    title="Click to sort by P/L %"
                                    className="text-sm font-semibold p-4 text-right bg-white/10 cursor-pointer select-none"
                                >
                                    P/L % {sortByPL ? (sortPLPercentageAsc ? '↑' : '↓') : ''}
                                </th>
                                <th className="text-sm font-semibold p-4 text-center bg-white/10 cursor-default select-none">
                                    Sold %
                                </th>
                                <th className="text-sm font-semibold p-4 text-center bg-white/10 cursor-default select-none">
                                    Status
                                </th>
                                <th className="text-sm font-semibold p-4 text-right bg-white/10 cursor-default select-none">
                                    Close Price
                                </th>
                                <th className="text-sm font-semibold p-4 bg-white/10 cursor-default select-none">
                                    Notes
                                </th>
                                <th className="text-sm font-semibold p-4 text-center bg-white/10 cursor-default select-none">
                                    Actions
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredPortfolio.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={16}
                                        className="text-center p-10 text-gray-400"
                                    >
                                        {portfolio.length === 0
                                            ? 'No investments added yet. Click "Add Investment" to get started!'
                                            : showClosedPositions
                                                ? 'No closed positions found.'
                                                : 'No open positions found. Toggle "Show Closed" to view closed positions.'}
                                    </td>
                                </tr>
                            ) : (
                                processedData.map(investment => (
                                    <tr
                                        key={investment.id}
                                        className={`transition-colors duration-200 ${
                                            investment.status === 'closed'
                                                ? 'bg-slate-400/70'
                                                : ''
                                        }`}
                                    >
                                        <td className="p-4 text-center text-xs text-white/90">
                                            {investment.dateAdded
                                                ? new Date(investment.dateAdded).toLocaleDateString()
                                                : '—'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <div className="">{investment.tokenName}</div>
                                                <div className="text-xs text-gray-400 uppercase">{investment.symbol}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">{investment.quantity.toFixed(4)}</td>
                                        <td className="p-4 text-right">${investment.purchasePrice.toFixed(2)}</td>
                                        <td className="p-4 text-right">${investment.amountPaid.toFixed(2)}</td>
                                        <td className="p-4 text-right">${investment.currentPrice.toFixed(2)}</td>
                                        <td className="p-4 text-right">${investment.currentValue.toFixed(2)}</td>
                                        <td
                                            className={`p-4 text-right font-bold ${
                                                investment.profitLoss >= 0
                                                    ? 'text-green-400'
                                                    : 'text-red-400'
                                            }`}
                                        >
                                            ${investment.profitLoss.toFixed(2)}
                                        </td>
                                        <td
                                            className={`p-4 text-right font-bold ${
                                                investment.profitLossPercentage >= 0
                                                    ? 'text-green-400'
                                                    : 'text-red-400'
                                            }`}
                                        >
                                            {investment.profitLossPercentage >= 0 ? '+' : ''}
                                            {investment.profitLossPercentage.toFixed(2)}%
                                        </td>
                                        <td className="p-4 text-center">
                                            {investment.sold ? `${investment.sold}%` : '—'}
                                        </td>
                                        <td className="p-4 text-center capitalize">
                                            {investment.status || 'open'}
                                        </td>
                                        <td className="p-4 text-right">
                                            {investment.closePrice
                                                ? `$${investment.closePrice.toFixed(2)}`
                                                : '—'}
                                        </td>
                                        <td
                                            className="p-4 max-w-[150px] truncate text-xs text-gray-400"
                                            title={investment.notes || ''}
                                        >
                                            {investment.notes || '—'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(investment)}
                                                    title="Edit"
                                                    className="text-sky-400 p-1 rounded hover:bg-white/20 transition"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(investment.id)}
                                                    title="Remove"
                                                    className="text-red-400 p-1 rounded hover:bg-white/20 transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CryptoTrackerPage;
