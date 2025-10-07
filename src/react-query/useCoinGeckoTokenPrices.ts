import { useQuery } from '@tanstack/react-query';
import { fetchPrices, CoinGeckoPriceResponse } from '@/utils/api/fetchTokenPrices';

export const useCoinGeckoTokenPrices = (symbols: string[]) => {
	return useQuery<CoinGeckoPriceResponse, Error>({
		queryKey: ['token-prices', symbols],
		queryFn: () => fetchPrices(symbols),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: symbols.length > 0, // only fetch if symbols array is not empty
	});
};
