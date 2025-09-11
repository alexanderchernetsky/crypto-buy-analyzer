import React, { useState } from "react";
import { DollarSign } from "lucide-react";
import {useAddPool} from "@/react-query/useLiquidityPools";


export interface FormData {
    id: number;
    poolName: string;
    startDate: string;
    endDate: string;
    rangeFrom: number;
    rangeTo: number;
    principal: number;
    earnings: number;
    status: "open" | "closed";
}

const AddLiquidityPoolCard: React.FC = () => {
    const { mutateAsync: addPool, isPending } = useAddPool();
    const [formData, setFormData] = useState<FormData>({
        id: 0,
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
                    : (value as any),
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
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8"
        >
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-600" />
                Create New Liquidity Pool
            </h2>

            <div className="space-y-4">
                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <select
                        value={formData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="LP1 - Orca SOL/USDC"
                    />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange("startDate", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price Range
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            value={formData.rangeFrom}
                            onChange={(e) => handleChange("rangeFrom", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="From"
                        />
                        <input
                            type="number"
                            value={formData.rangeTo}
                            onChange={(e) => handleChange("rangeTo", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="To"
                        />
                    </div>
                </div>

                {/* Principal */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Principal Amount
                    </label>
                    <input
                        type="number"
                        value={formData.principal}
                        onChange={(e) => handleChange("principal", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="4177"
                    />
                </div>

                {/* Earnings */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Earnings
                    </label>
                    <input
                        type="number"
                        value={formData.earnings}
                        onChange={(e) => handleChange("earnings", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="10.3"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3 mt-4 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {isPending ? "Creating..." : "Create Pool"}
                </button>
            </div>
        </form>
    );
};

export default AddLiquidityPoolCard;
