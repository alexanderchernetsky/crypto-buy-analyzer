export type OHLCVEntry = [number, number, number, number, number, number];

interface PriceRange {
    min: number;
    max: number;
}

interface Ranges {
    oneMonth: PriceRange | null;
    oneYear: PriceRange | null;
    allTime: PriceRange | null;
}

function getPriceRanges(data: OHLCVEntry[]): Ranges {
    if (!data || data.length === 0) {
        return { oneMonth: null, oneYear: null, allTime: null };
    }

    const latestTimestamp = data[0][0]; // newest timestamp from the API
    const monthAgo = latestTimestamp - 30 * 24 * 60 * 60;
    const yearAgo = latestTimestamp - 365 * 24 * 60 * 60;

    const filterByRange = (start: number) =>
        data.filter(([timestamp]) => timestamp >= start);

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
        oneYear: calcRange(filterByRange(yearAgo)),
        allTime: calcRange(data),
    };
}


export default getPriceRanges;
