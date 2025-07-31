import React from 'react';

interface TokenFormData {
    tokenName: string;
    symbol: string;
    allTimeLow: string;
    allTimeHigh: string;
    oneYearLow: string;
    oneYearHigh: string;
    oneMonthLow: string;
    oneMonthHigh: string;
}

interface AddTokenToBuyAnalyzerFormProps {
    formData: TokenFormData;
    setFormData: (data: TokenFormData) => void;
    handleSubmit: () => void;
    loading: boolean;
    setShowAddForm: (show: boolean) => void;
}

export const AddTokenToBuyAnalyzerForm: React.FC<AddTokenToBuyAnalyzerFormProps> = ({
                                                                                        formData,
                                                                                        setFormData,
                                                                                        handleSubmit,
                                                                                        loading,
                                                                                        setShowAddForm,
                                                                                    }) => {
    const handleCancel = () => {
        setShowAddForm(false);
    };

    return (
        <div className="mt-6 mb-6 rounded-2xl border border-white/40 bg-gray-900/80 p-6 shadow-lg backdrop-blur-sm">
            <h2 className="mb-5 text-xl font-bold text-white">
                Add New Token
            </h2>

            <div className="mb-5 grid gap-4 md:grid-cols-2">
                {[ // Same for each input group
                    { label: 'Token Name*', value: formData.tokenName, key: 'tokenName', placeholder: 'e.g., Bitcoin', type: 'text' },
                    { label: 'Symbol (CoinGecko ID)*', value: formData.symbol, key: 'symbol', placeholder: 'e.g., bitcoin', type: 'text' },
                    { label: 'All-Time Low', value: formData.allTimeLow ?? '', key: 'allTimeLow', placeholder: '0.00', type: 'number' },
                    { label: 'All-Time High', value: formData.allTimeHigh ?? '', key: 'allTimeHigh', placeholder: '0.00', type: 'number' },
                    { label: '1-Year Low', value: formData.oneYearLow ?? '', key: 'oneYearLow', placeholder: '0.00', type: 'number' },
                    { label: '1-Year High', value: formData.oneYearHigh ?? '', key: 'oneYearHigh', placeholder: '0.00', type: 'number' },
                    { label: '1-Month Low', value: formData.oneMonthLow ?? '', key: 'oneMonthLow', placeholder: '0.00', type: 'number' },
                    { label: '1-Month High', value: formData.oneMonthHigh ?? '', key: 'oneMonthHigh', placeholder: '0.00', type: 'number' },
                ].map(({ label, value, key, placeholder, type }) => (
                    <div key={key} className="flex flex-col">
                        <label className="mb-2 text-sm text-gray-300">{label}</label>
                        <input
                            type={type}
                            step={type === 'number' ? 'any' : undefined}
                            value={value}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                            placeholder={placeholder}
                            className="rounded-lg border border-gray-600 bg-gray-800 p-3 text-sm text-white placeholder-gray-400
                     focus:border-green-500 focus:ring-2 focus:ring-green-400 focus:outline-none transition"
                        />
                    </div>
                ))}
            </div>

            <div className="mb-2 flex flex-wrap gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Add Token
                </button>
                <button
                    onClick={handleCancel}
                    className="rounded-lg bg-gray-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                >
                    Cancel
                </button>
            </div>

            <div className="mt-2 text-xs text-gray-400">
                * Use CoinGecko IDs for symbols (e.g., bitcoin, ethereum). Check coingecko.com for exact IDs.
            </div>
        </div>

    );
};
