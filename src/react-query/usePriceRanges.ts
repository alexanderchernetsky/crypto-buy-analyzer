import {useQuery} from "@tanstack/react-query";
import fetchPriceRanges from "@/gecko-terminal/fetchPriceRanges";


export const usePriceRanges = () => {
    return useQuery({
        queryKey: ['price-ranges'],
        queryFn: () => fetchPriceRanges(),
        staleTime: 30 * 60 * 1000, // 30 minutes
    });
};
