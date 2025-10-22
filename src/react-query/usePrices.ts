import { skipToken, useQuery} from '@tanstack/react-query';
import {useMemo} from "react";
import {type CoinGeckoPriceResponse, fetchPrices } from "@/utils/api/fetchTokenPrices";

// fetched crypto token prices from CoinGecko
export const usePrices = (symbols: string[]) => {
    const key = useMemo(() => ['token-prices', symbols.sort()], [symbols]);
    return useQuery<CoinGeckoPriceResponse, Error>({
        queryKey: key,
        queryFn: symbols.length > 0 ? () => fetchPrices(symbols) : skipToken,
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 60 * 1000, // poll every 1 minute
        refetchOnWindowFocus: false, // prevent refetching on focus if you only want polling
    });
};
