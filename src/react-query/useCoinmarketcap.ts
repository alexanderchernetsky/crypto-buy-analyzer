import {useQuery} from "@tanstack/react-query";
import fetchCoinmarketcapData from "@/utils/api/fetchCoinmarketcapData";

export const useCoinmarketcap = () => {
    return useQuery({
        queryKey: ['coinmarketcap-data'],
        queryFn: () => fetchCoinmarketcapData(),
        staleTime: Infinity,
    });
};
