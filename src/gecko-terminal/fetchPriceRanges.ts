import geckoterminal from "@/gecko-terminal/index";
import getPriceRanges, {OHLCVEntry, Ranges} from "@/gecko-terminal/getPriceRanges";

export type Timeframe = 'day' | 'hour' | 'minute';

// Available values (day): 1
// Available values (hour): 1, 4, 12
// Available values (minute): 1, 5, 15
const aggregate = {
    day: 1,
    hour: {
        '1': 1,
        '4': 4,
        '12': 12,
    },
    minute: {
        '1': 1,
        '5': 5,
        '15': 15,
    },
}


// https://www.geckoterminal.com/dex-api
const pools = {
    // todo: I couldn't find any pools for these tokens, so I'm leaving them commented out
    // wormhole: {
    //     poolKey: '',
    //     network: '',
    // },
    ['jupiter-exchange-solana']: {
        poolKey: 'BhQEFZCRnWKQ21LEt4DUby7fKynfmLVJcNjfHNqjEF61',
        network: 'solana',
    },
    // toncoin: {
    //     poolKey: 'EQA-X_yo3fzzbDbJ_0bzFWKqtRuZFIRa1sJsveZJ1YpViO3r',
    //     network: 'ton',
    // },
    chainlink: {
        poolKey: '0xac5a2c404ebba22a869998089ac7893ff4e1f0a7',
        network: 'eth',
    },
    morpho: {
        poolKey: '0x2043b296ffc6b2d3bf4a3f3167d2afb3b0fbdbee',
        network: 'base',
    },
    uniswap: {
        poolKey: '0x3470447f3cecffac709d3e783a307790b0208d60',
        network: 'eth',
    },
    // bitcoin: {
    //   poolKey: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    //   network: 'arbitrum',
    // },
    solana: {
        poolKey: 'BVRbyLjjfSBcoyiYFuxbgKYnWuiFaF9CSXEa5vdSZ9Hh',
        network: 'solana',
    },
}

async function fetchPriceRange(poolName: string, poolData: {poolKey: string, network: string }): Promise<Ranges | undefined> {
    const timeframe: Timeframe =  'day';
    const aggregateValue = aggregate.day;

    try {
        const response = await geckoterminal.pools.ohlcv(
            { poolKey: poolData.poolKey, network: poolData.network, timeframe },
            { aggregate: aggregateValue, limit: 1000, includeEmptyIntervals: true }
        );

        const ohlcvList: OHLCVEntry[] = response.data.attributes.ohlcv_list;
        const ranges = getPriceRanges(ohlcvList);

        console.log(`Fetched ranges for ${poolName}:`, ranges);
        return ranges;
    } catch (error) {
        console.error(`Failed to fetch ranges for ${poolName}:`, error);
    }
}

async function fetchPriceRanges() {
    const results: Record<string, Ranges> = {};

    for (const [poolName, poolData] of Object.entries(pools)) {
        const range = await fetchPriceRange(poolName, poolData);

        if (range) {
            results[poolName] = range;
        }
    }

    return results;
}

export default fetchPriceRanges;
