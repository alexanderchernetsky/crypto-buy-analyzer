import geckoterminal from "@/gecko-terminal/index";
import getPriceRanges, {OHLCVEntry} from "@/gecko-terminal/getPriceRanges";

const hour = 60 * 60 * 1000;
const day = 24 * hour;

export type TimeseriesInterval = '5m' | '15m' | '1h' | '4h' | '6h' | '12h' | '1d' | '1w' | '1m' | '1y';
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

async function fetchPriceRanges() {
    const meteoraSolUsdcPool = 'BVRbyLjjfSBcoyiYFuxbgKYnWuiFaF9CSXEa5vdSZ9Hh';
    const orcaSolUsdcPool = 'Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE';
    const raydiumSolUsdcPool = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2';

    const timeframe: Timeframe =  'day';
    const aggregateValue = aggregate.day;

    const response = await geckoterminal.pools.ohlcv({ poolKey: meteoraSolUsdcPool, timeframe }, { aggregate: aggregateValue, limit: 1000, includeEmptyIntervals: true });
    console.log('response', response);
    const ohlcvList: OHLCVEntry[] = response.data.attributes.ohlcv_list;
    const ranges = getPriceRanges(ohlcvList);

    console.log("1M:", ranges.oneMonth);
    console.log("1Y:", ranges.oneYear);
    console.log("All:", ranges.allTime); // todo: this value is NOT correct

    return ranges;
}

export default fetchPriceRanges;
