export type OHLCVEntry = [number, number, number, number, number, number];

interface PriceRange {
	min: number;
	max: number;
}

export interface Ranges {
	oneMonth: PriceRange | null;
	sixMonth: PriceRange | null;
}

function getPriceRanges(data: OHLCVEntry[]): Ranges {
	// data only up to 6 month ago (limitation from gecko terminal API)
	if (!data || data.length === 0) {
		return { oneMonth: null, sixMonth: null };
	}

	const latestTimestamp = data[0][0]; // newest timestamp from the API
	const monthAgo = latestTimestamp - 30 * 24 * 60 * 60;
	const sixMonthAgo = latestTimestamp - 182 * 24 * 60 * 60;

	const filterByRange = (start: number) => data.filter(([timestamp]) => timestamp >= start);

	const calcRange = (subset: OHLCVEntry[]): PriceRange | null => {
		if (subset.length === 0) return null;
		let min = Infinity;
		let max = -Infinity;
		for (const [, , high, low] of subset) {
			if (low < min) min = low;
			if (high > max) max = high;
		}
		return { min, max };
	};

	return {
		oneMonth: calcRange(filterByRange(monthAgo)),
		sixMonth: calcRange(filterByRange(sixMonthAgo)),
	};
}

export default getPriceRanges;
