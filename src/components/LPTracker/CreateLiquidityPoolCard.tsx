import React, { useState } from 'react';
import { DollarSign, X, Plus } from 'lucide-react';
import { useAddPool } from '@/react-query/useLiquidityPools';
import { EarningRow } from '@/types/liquidity-pools';

export type NewPoolFormData = Omit<FormData, 'id'>;

export interface FormData {
	id: string;
	poolName: string;
	tokenSymbol: string;
	entryPrice: number;
	rangeFrom: number;
	rangeTo: number;
	status: 'open' | 'closed';
	earningRows: EarningRow[];
	comments?: string;
}

interface AddLiquidityPoolModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const AddLiquidityPoolModal: React.FC<AddLiquidityPoolModalProps> = ({ isOpen, onClose }) => {
	const { mutateAsync: addPool, isPending } = useAddPool();

	const [formData, setFormData] = useState<NewPoolFormData>({
		poolName: '',
		tokenSymbol: '',
		entryPrice: 0,
		rangeFrom: 0,
		rangeTo: 0,
		status: 'open',
		earningRows: [
			{
				id: `row_${Date.now()}`,
				startDate: '',
				endDate: '',
				earnings: 0,
				gathered: 'no',
				principal: 1000,
			},
		],
		comments: '',
	});

	const handleChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: ['rangeFrom', 'rangeTo', 'entryPrice'].includes(field) // ✅ include entryPrice
				? parseFloat(value) || 0
				: value,
		}));
	};

	const addEarningRow = () => {
		const newRow: EarningRow = {
			id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			startDate: '',
			endDate: '',
			earnings: 0,
			gathered: 'no',
			principal: 1000,
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
							[field]: field === 'earnings' || field === 'principal' ? parseFloat(value.toString()) || 0 : value,
						}
					: row,
			),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await addPool(formData);
		setFormData({
			poolName: '',
			tokenSymbol: '',
			entryPrice: 0, // ✅ reset on submit
			rangeFrom: 0,
			rangeTo: 0,
			status: 'open',
			earningRows: [
				{
					id: `row_${Date.now()}`,
					startDate: '',
					endDate: '',
					earnings: 0,
					gathered: 'no',
					principal: 1000,
				},
			],
			comments: '',
		});
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
			<div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-300">
				{/* Modal Header */}
				<div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 rounded-t-2xl flex justify-between items-center">
					<h2 className="text-2xl font-semibold flex items-center gap-3">
						<div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
							<DollarSign className="w-6 h-6 text-white" />
						</div>
						Create New Liquidity Pool Position
					</h2>
					<button onClick={onClose} className="cursor-pointer p-2 hover:bg-slate-800 rounded-lg transition-colors">
						<X className="w-6 h-6 text-slate-400 hover:text-white" />
					</button>
				</div>

				{/* Modal Body */}
				<form onSubmit={handleSubmit} className="p-6 space-y-6">
					<div className="grid grid-cols-2 gap-4">
						{/* Status */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
							<select
								value={formData.status}
								onChange={(e) => handleChange('status', e.target.value)}
								className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							>
								<option value="open">Open</option>
								<option value="closed">Closed</option>
							</select>
						</div>

						{/* Pool Name */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">Pool Name</label>
							<input
								type="text"
								value={formData.poolName}
								onChange={(e) => handleChange('poolName', e.target.value)}
								placeholder="LP1 - Orca SOL/USDC"
								required
								className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						{/* Token Symbol */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">Token Symbol (Coin Gecko ID)</label>
							<input
								type="text"
								value={formData.tokenSymbol || ''}
								onChange={(e) => handleChange('tokenSymbol', e.target.value)}
								placeholder="e.g., ethereum, solana"
								required
								className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							/>
						</div>

						{/* Entry Price */}
						<div>
							<label className="block text-sm font-medium text-slate-300 mb-2">Entry Price</label>
							<input
								type="number"
								step="0.01"
								value={formData.entryPrice}
								onChange={(e) => handleChange('entryPrice', e.target.value)}
								placeholder="e.g., 1500.50"
								required
								className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							/>
						</div>
					</div>

					{/* Price Range */}
					<div>
						<label className="block text-sm font-medium text-slate-300 mb-2">Price Range</label>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<input
								type="number"
								step="1"
								value={formData.rangeFrom}
								onChange={(e) => handleChange('rangeFrom', e.target.value)}
								placeholder="Min Price"
								required
								className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							/>
							<input
								type="number"
								step="1"
								value={formData.rangeTo}
								onChange={(e) => handleChange('rangeTo', e.target.value)}
								placeholder="Max Price"
								required
								className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
							/>
						</div>
					</div>

					{/* Earning Periods */}
					<div>
						<div className="flex justify-between items-center mb-3">
							<label className="block text-sm font-medium text-slate-300">Earning Periods</label>
							<button
								type="button"
								onClick={addEarningRow}
								className="cursor-pointer flex items-center gap-1 px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
							>
								<Plus className="w-4 h-4 text-white" />
								Add Period
							</button>
						</div>

						<div className="space-y-3">
							{formData.earningRows.map((row) => (
								<div key={row.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-800 rounded-lg">
									<input
										type="date"
										value={row.startDate}
										onChange={(e) => updateEarningRow(row.id, 'startDate', e.target.value)}
										className="col-span-2 px-3 py-2 text-sm rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500"
									/>
									<input
										type="date"
										value={row.endDate}
										onChange={(e) => updateEarningRow(row.id, 'endDate', e.target.value)}
										className="col-span-2 px-3 py-2 text-sm rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500"
									/>
									<input
										type="number"
										value={row.principal}
										onChange={(e) => updateEarningRow(row.id, 'principal', e.target.value)}
										className="col-span-2 px-3 py-2 text-sm rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500"
									/>
									<input
										type="number"
										value={row.earnings}
										onChange={(e) => updateEarningRow(row.id, 'earnings', e.target.value)}
										className="col-span-3 px-3 py-2 text-sm rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500"
									/>
									<select
										value={row.gathered}
										onChange={(e) => updateEarningRow(row.id, 'gathered', e.target.value)}
										className="col-span-2 px-3 py-2 text-sm rounded-lg bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500"
									>
										<option value="no">No</option>
										<option value="yes">Yes</option>
									</select>
									<button
										type="button"
										onClick={() => removeEarningRow(row.id)}
										className="col-span-1 flex justify-end text-red-500 hover:text-red-700"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
							))}
						</div>
					</div>

					{/* Comments */}
					<div>
						<label className="block text-sm font-medium text-slate-300 mb-2">Comments</label>
						<textarea
							value={formData.comments || ''}
							onChange={(e) => handleChange('comments', e.target.value)}
							rows={3}
							placeholder="Optional notes about this pool..."
							className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-indigo-500 resize-vertical"
						/>
					</div>

					{/* Footer */}
					<div className="flex flex-col sm:flex-row gap-3 pt-6 mt-6 border-t border-slate-700">
						<button
							type="button"
							onClick={onClose}
							className="cursor-pointer flex-1 px-6 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isPending}
							className="cursor-pointer  flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
						>
							{isPending ? 'Creating...' : 'Create Pool'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddLiquidityPoolModal;
