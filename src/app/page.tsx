'use client';
import React, { useEffect, useState } from 'react';
import { DollarSign, RefreshCw, Plus, Pencil, Trash2, Filter } from 'lucide-react';
import {
	useInvestments,
	useAddInvestment,
	useRemoveInvestment,
	useUpdateInvestment,
	Investment,
} from '@/react-query/useInvestments';
import { fetchPrices } from '@/utils/api/fetchTokenPrices';
import { CryptoPortfolioSummary } from '@/components/CryptoTracker/CryptoPortfolioSummary';
import { AddCryptoInvestmentForm } from '@/components/CryptoTracker/AddCryptoInvestmentForm';
import { processCryptoTrackerData } from '@/utils/processCryptoTrackerData';

export interface InvestmentFormData {
	tokenName: string;
	symbol: string;
	quantity: string;
	purchasePrice: string;
	amountPaid: string;
	dateAdded: string;
	status: string;
	sold: string;
	closePrice: string;
	closedAt?: string;
	notes: string;
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
			const openInvestments = investments.filter((inv) => inv.status !== 'closed');
			const closedInvestments = investments.filter((inv) => inv.status === 'closed');

			let enriched: Investment[] = [];

			// Only fetch prices for open investments
			if (openInvestments.length > 0) {
				const data = await fetchPrices(openInvestments.map((i) => i.symbol));

				// Update open investments with new prices
				const updatedOpenInvestments = openInvestments.map((inv) => {
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
			const preservedClosedInvestments = closedInvestments.map((inv) => {
				const closePrice = inv.closePrice ?? 0;
				const quantity = inv.quantity ?? 0;
				const amountPaid = inv.amountPaid ?? 0;

				const currentValue = quantity * closePrice;
				const profitLoss = currentValue - amountPaid;
				const profitLossPercentage = (profitLoss / amountPaid) * 100;

				return {
					...inv,
					currentPrice: closePrice, // For display consistency
					currentValue: currentValue, // Fixed at sell time
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
			closedAt: investment.closedAt,
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
					closedAt: formData.closedAt,
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
				closedAt: '',
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
		if (!confirm('Are you sure you want to delete this investment? This action cannot be undone.')) {
			return;
		}

		try {
			await removeMutation.mutateAsync(id);
		} catch (err) {
			alert('Failed to remove');
		}
	};

	const handleAddNewInvestmentClick = () => {
		setEditingInvestment(null); // reset edit mode
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
		}); // reset form
		setShowAddForm(true);
	};

	const portfolio = updatedInvestments.length ? updatedInvestments : investments;

	// Filter portfolio based on showClosedPositions toggle
	const filteredPortfolio = showClosedPositions
		? portfolio
		: portfolio.filter((investment) => investment.status !== 'closed');

	// calculate summary data
	const openPositions = filteredPortfolio.filter((inv) => inv.status === 'open');
	const totalInvested = openPositions.reduce((sum, i) => sum + i.amountPaid, 0);
	const totalCurrentValue = openPositions.reduce((sum, i) => sum + (i.currentValue ?? 0), 0);
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

	// Count closed and open positions
	const closedPositionsCount = portfolio.filter((inv) => inv.status === 'closed').length;
	const openPositionsCount = portfolio.filter((inv) => inv.status !== 'closed').length;
	const realisedProfitLoss = portfolio
		.filter((inv) => inv.status === 'closed')
		.reduce((sum, i) => sum + (i.currentValue - i.amountPaid), 0);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
			<div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
					<div className="flex flex-col lg:flex-row gap-3 items-center justify-between mb-6">
						<h1 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
							<DollarSign className="text-emerald-500" />
							Crypto Investment Tracker
						</h1>
						<div className="flex flex-wrap gap-2">
							<button
								onClick={updatePrices}
								disabled={loading || investments.length === 0}
								className={`cursor-pointer inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold text-white transition
                                    ${loading || investments.length === 0 ? 'bg-slate-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}
                                `}
							>
								<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
								Refresh Prices
							</button>
							<button
								onClick={() => setShowClosedPositions(!showClosedPositions)}
								disabled={closedPositionsCount === 0}
								className={`cursor-pointer inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-semibold text-white transition
                                    ${
																			showClosedPositions
																				? 'bg-blue-600 hover:bg-blue-700'
																				: 'bg-slate-600 hover:bg-slate-700'
																		} disabled:opacity-50 disabled:cursor-not-allowed`}
							>
								<Filter className="w-4 h-4" />
								{showClosedPositions ? 'Hide' : 'Show'} Closed ({closedPositionsCount})
							</button>
							<button
								onClick={handleAddNewInvestmentClick}
								className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
							>
								<Plus className="w-4 h-4" />
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
						openPositionsCount={openPositionsCount}
					/>
				</div>

				{/* Add Investment Form */}
				<AddCryptoInvestmentForm
					isOpen={showAddForm}
					onClose={() => setShowAddForm(false)}
					editingInvestment={editingInvestment}
					setEditingInvestment={setEditingInvestment}
					formData={formData}
					setFormData={setFormData}
					loading={loading}
					handleSubmit={handleSubmit}
				/>

				{/* Investments Table */}
				<div className="bg-slate-800 rounded-xl border border-slate-700 mt-6 overflow-x-auto">
					<table className="w-full min-w-[1400px] table-auto border-collapse">
						<thead>
							<tr>
								<th className="border-b border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-300">
									Date of Purchase
								</th>
								<th className="border-b border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-300">
									Token
								</th>
								<th className="border-b border-slate-700 px-4 py-3 text-right text-sm font-semibold text-slate-300">
									Quantity
								</th>
								<th className="border-b border-slate-700 px-4 py-3 text-right text-sm font-semibold text-slate-300">
									Purchase Price
								</th>
								<th className="border-b border-slate-700 px-4 py-3 text-right text-sm font-semibold text-slate-300">
									Amount Paid
								</th>
								<th className="border-b border-slate-700 px-4 py-3 text-right text-sm font-semibold text-slate-300">
									Current Price
								</th>
								<th className="border-b border-slate-700 px-4 py-3 text-right text-sm font-semibold text-slate-300">
									Current Value
								</th>
								<th className="border-b border-slate-700 px-4 py-3 text-right text-sm font-semibold text-slate-300">
									Profit/Loss
								</th>
								<th
									onClick={() => {
										if (!sortByPL) setSortByPL(true);
										else setSortPLPercentageAsc((prev) => !prev);
									}}
									title="Click to sort by P/L %"
									className="border-b border-slate-700 px-4 py-3 text-right text-sm font-semibold text-slate-300 cursor-pointer hover:bg-slate-700"
								>
									P/L % {sortByPL ? (sortPLPercentageAsc ? '↑' : '↓') : ''}
								</th>
								<th className="border-b border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-300">
									Sold %
								</th>
								<th className="border-b border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-300">
									Status
								</th>
								<th className="border-b border-slate-700 px-4 py-3 text-right text-sm font-semibold text-slate-300">
									Close Price
								</th>
								<th className="border-b border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-300">
									Notes
								</th>
								<th className="border-b border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-300">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{filteredPortfolio.length === 0 ? (
								<tr>
									<td colSpan={14} className="px-4 py-10 text-center text-sm text-slate-400">
										{portfolio.length === 0
											? 'No investments added yet. Click "Add Investment" to get started!'
											: showClosedPositions
												? 'No closed positions found.'
												: 'No open positions found. Toggle "Show Closed" to view closed positions.'}
									</td>
								</tr>
							) : (
								processedData.map((investment) => (
									<tr
										key={investment.id}
										className={`border-b border-slate-700 last:border-0 hover:bg-slate-700 transition-colors duration-200 ${
											investment.status === 'closed' ? 'bg-slate-600/30' : ''
										}`}
									>
										<td className="px-4 py-3 text-sm text-slate-300">
											{investment.dateAdded ? new Date(investment.dateAdded).toLocaleDateString() : '—'}
										</td>
										<td className="px-4 py-3">
											<div>
												<div className="font-semibold text-slate-100">{investment.tokenName}</div>
												<div className="text-xs text-slate-400 uppercase">{investment.symbol}</div>
											</div>
										</td>
										<td className="px-4 py-3 text-right text-slate-100 font-mono">{investment.quantity.toFixed(4)}</td>
										<td className="px-4 py-3 text-right text-slate-100 font-mono">
											${investment.purchasePrice.toFixed(2)}
										</td>
										<td className="px-4 py-3 text-right text-slate-100 font-mono">
											${investment.amountPaid.toFixed(2)}
										</td>
										<td className="px-4 py-3 text-right text-slate-100 font-mono">
											${investment.currentPrice.toFixed(2)}
										</td>
										<td className="px-4 py-3 text-right text-slate-100 font-mono font-semibold">
											${investment.currentValue.toFixed(2)}
										</td>
										<td
											className={`px-4 py-3 text-right font-mono font-semibold ${
												investment.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
											}`}
										>
											${investment.profitLoss.toFixed(2)}
										</td>
										<td
											className={`px-4 py-3 text-right font-mono font-semibold ${
												investment.profitLossPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'
											}`}
										>
											{investment.profitLossPercentage >= 0 ? '+' : ''}
											{investment.profitLossPercentage.toFixed(2)}%
										</td>
										<td className="px-4 py-3 text-center text-slate-300">
											{investment.sold ? `${investment.sold}%` : '—'}
										</td>
										<td className="px-4 py-3 text-center">
											<span
												className={`px-2 py-1 text-xs font-semibold rounded-md capitalize ${
													investment.status === 'closed'
														? 'bg-slate-600 text-slate-200'
														: 'bg-emerald-600/20 text-emerald-400'
												}`}
											>
												{investment.status || 'open'}
											</span>
										</td>
										<td className="px-4 py-3 text-right text-slate-100 font-mono">
											{investment.closePrice ? `$${investment.closePrice.toFixed(2)}` : '—'}
										</td>
										<td
											className="px-4 py-3 max-w-[150px] truncate text-xs text-slate-400"
											title={investment.notes || ''}
										>
											{investment.notes || '—'}
										</td>
										<td className="px-4 py-3 text-center">
											<div className="flex justify-center gap-2">
												<button
													onClick={() => handleEdit(investment)}
													title="Edit"
													className="cursor-pointer text-blue-500 hover:text-blue-400 p-1 rounded hover:bg-slate-600 transition"
												>
													<Pencil className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleRemove(investment.id)}
													title="Remove"
													className="cursor-pointer text-red-500 hover:text-red-400 p-1 rounded hover:bg-slate-600 transition"
												>
													<Trash2 className="w-4 h-4" />
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
	);
};

export default CryptoTrackerPage;
