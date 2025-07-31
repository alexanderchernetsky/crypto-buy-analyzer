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

interface TokenFormProps {
    mode: 'add' | 'edit';
    formData: TokenFormData;
    setFormData: (data: TokenFormData) => void;
    handleSubmit: () => void;
    loading: boolean;
    onCancel: () => void;
    tokenName?: string; // Only used in edit mode
}

export const TokenForm: React.FC<TokenFormProps> = ({
    mode,
    formData,
    setFormData,
    handleSubmit,
    loading,
    onCancel,
    tokenName,
}) => {
    const isEditMode = mode === 'edit';

    // Styling configuration based on mode
    const config = isEditMode ? {
        borderColor: 'border-blue-500/40',
        backgroundColor: 'bg-slate-800/90',
        titleColor: 'text-white',
        labelColor: 'text-slate-300',
        inputBorder: 'border-slate-600',
        inputBg: 'bg-slate-700',
        inputPlaceholder: 'placeholder-slate-400',
        focusBorder: 'focus:border-blue-500',
        focusRing: 'focus:ring-blue-400',
        primaryButton: 'bg-blue-600 hover:bg-blue-700',
        secondaryButton: 'bg-slate-600 hover:bg-slate-700',
        helperText: 'text-slate-400',
        title: `Edit Token: ${tokenName}`,
        buttonText: 'Update Token'
    } : {
        borderColor: 'border-white/40',
        backgroundColor: 'bg-gray-900/80',
        titleColor: 'text-white',
        labelColor: 'text-gray-300',
        inputBorder: 'border-gray-600',
        inputBg: 'bg-gray-800',
        inputPlaceholder: 'placeholder-gray-400',
        focusBorder: 'focus:border-green-500',
        focusRing: 'focus:ring-green-400',
        primaryButton: 'bg-green-600 hover:bg-green-700',
        secondaryButton: 'bg-gray-600 hover:bg-gray-700',
        helperText: 'text-gray-400',
        title: 'Add New Token',
        buttonText: 'Add Token'
    };

    return (
        <div className={`mt-6 mb-6 rounded-2xl border ${config.borderColor} ${config.backgroundColor} p-6 shadow-lg backdrop-blur-sm`}>
            <h2 className={`mb-5 text-xl font-bold ${config.titleColor}`}>
                {config.title}
            </h2>

            <div className="mb-5 grid gap-4 md:grid-cols-2">
                {[
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
                        <label className={`mb-2 text-sm ${config.labelColor}`}>{label}</label>
                        <input
                            type={type}
                            step={type === 'number' ? 'any' : undefined}
                            value={value}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                            placeholder={placeholder}
                            className={`rounded-lg border ${config.inputBorder} ${config.inputBg} p-3 text-sm text-white ${config.inputPlaceholder}
                     ${config.focusBorder} focus:ring-2 ${config.focusRing} focus:outline-none transition`}
                        />
                    </div>
                ))}
            </div>

            <div className="mb-2 flex flex-wrap gap-3">
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`rounded-lg ${config.primaryButton} px-5 py-2 text-sm font-medium text-white transition
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {config.buttonText}
                </button>
                <button
                    onClick={onCancel}
                    className={`rounded-lg ${config.secondaryButton} px-5 py-2 text-sm font-medium text-white transition`}
                >
                    Cancel
                </button>
            </div>

            <div className={`mt-2 text-xs ${config.helperText}`}>
                * Use CoinGecko IDs for symbols (e.g., bitcoin, ethereum). Check coingecko.com for exact IDs.
            </div>
        </div>
    );
};
