type BuySignalType = 'STRONG BUY' | 'BUY' | 'CAUTION' | 'AVOID' | 'UNKNOWN';

interface BuySignal {
	signal: BuySignalType;
	color: string;
	text: string;
}

export const getBuySignal = (priceIndex: number | null): BuySignal => {
	if (priceIndex === null) {
		return {
			signal: 'UNKNOWN',
			color: '#6b7280',
			text: '—',
		};
	}

	if (priceIndex <= 0.1) {
		return {
			signal: 'STRONG BUY',
			color: '#10b981',
			text: 'Strong Buy',
		};
	} else if (priceIndex <= 0.4) {
		return {
			signal: 'BUY',
			color: '#34d399',
			text: 'Buy',
		};
	} else if (priceIndex <= 0.6) {
		return {
			signal: 'CAUTION',
			color: '#f59e0b',
			text: 'Caution',
		};
	} else {
		return {
			signal: 'AVOID',
			color: '#ef4444',
			text: 'Avoid',
		};
	}
};
