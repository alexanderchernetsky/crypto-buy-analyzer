import { skipToken, useQuery} from '@tanstack/react-query';
import {fetchPrices} from "@/utils/api/fetchTokenPrices";

export const usePrices = (symbols: string[]) => {
    return useQuery({
        queryKey: ['prices', symbols],
        queryFn: symbols.length > 0 ? () => fetchPrices(symbols) : skipToken,
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 60 * 1000, // poll every 1 minute
        refetchOnWindowFocus: false, // prevent refetching on focus if you only want polling
    });
};
