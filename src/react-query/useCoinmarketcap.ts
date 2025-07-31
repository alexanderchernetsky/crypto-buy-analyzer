import {useQuery} from "@tanstack/react-query";
import fetchCoinmarketcapData from "@/utils/api/fetchCoinmarketcapData";

export const useCoinmarketcap = () => {
    return useQuery({
        queryKey: ['coinmarketcap-data'],
        queryFn: () => fetchCoinmarketcapData(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
};
