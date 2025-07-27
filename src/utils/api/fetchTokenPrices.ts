export interface CoinGeckoPriceResponse {
    [symbol: string]: {
        usd: number;
    };
}

/**
 * Fetches current USD prices for given CoinGecko token IDs.
 * @param symbols - An array of CoinGecko IDs (e.g., ['bitcoin', 'ethereum'])
 * @returns A mapping of symbol -> { usd: number }
 */
export const fetchPrices = async (
    symbols: string[]
): Promise<CoinGeckoPriceResponse> => {
    const query = symbols.map((s) => s.toLowerCase()).join(',');
    const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${query}&vs_currencies=usd`
    );

    if (!res.ok) {
        throw new Error('Failed to fetch prices');
    }

    const data: CoinGeckoPriceResponse = await res.json();
    return data;
};
