/**
 * Returns a normalized price index between 0 and 1,
 * or null if data is invalid (e.g., low >= high).
 */
export function calculatePriceIndex(currentPrice: number, allTimeLow: number, allTimeHigh: number): number | null {
	if (allTimeLow == null || allTimeHigh == null || allTimeLow >= allTimeHigh) {
		return null;
	}

	return (currentPrice - allTimeLow) / (allTimeHigh - allTimeLow);
}

/**
 * Returns a normalized 1-year price index between 0 and 1,
 * or null if data is invalid (e.g., low >= high).
 */
export function calculateOneYearPriceIndex(
	currentPrice: number,
	oneYearLow: number,
	oneYearHigh: number,
): number | null {
	if (oneYearLow == null || oneYearHigh == null || oneYearLow >= oneYearHigh) {
		return null;
	}

	return (currentPrice - oneYearLow) / (oneYearHigh - oneYearLow);
}
