import { NextRequest } from 'next/server';

interface FearGreedData {
    value: string;
    value_classification: string;
    timestamp: string;
    time_until_update: string;
}

export async function GET(req: NextRequest) {
    const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
    if (!COINMARKETCAP_API_KEY) {
        return Response.json({ error: 'CoinMarketCap API key not set' }, { status: 500 });
    }

    try {
        // 1. Fetch Fear & Greed Index
        const fngResponse = await fetch(
            'https://pro-api.coinmarketcap.com/v3/fear-and-greed/historical',
            {
                headers: {
                    'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY!,
                },
            }
        );

        const fngJson = await fngResponse.json();
        const fearGreed: FearGreedData | null = fngJson?.data?.[0] ?? null;

        // // 2. Fetch altcoin data from CoinMarketCap
        // const cmcResponse = await fetch(
        //     'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100',
        //     {
        //         headers: {
        //             'X-CMC_PRO_API_KEY': COINMARKETCAP_API_KEY,
        //         },
        //         cache: 'no-store',
        //     }
        // );

        // const cmcJson = await cmcResponse.json();
        // const coins: CMCCoin[] = cmcJson?.data ?? [];

        // Filter altcoins (exclude BTC)
        // const altcoins = coins.filter((coin) => coin.symbol !== 'BTC');

        // Calculate total altcoin market cap
        // const totalAltcoinMarketCap = altcoins.reduce((acc, coin) => {
        //     return acc + (coin.quote?.USD?.market_cap ?? 0);
        // }, 0);

        return Response.json({
            fearGreedIndex: {
                value: fearGreed?.value,
                classification: fearGreed?.value_classification,
                timestamp: fearGreed?.timestamp,
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ error: message }, { status: 500 });
    }
}
