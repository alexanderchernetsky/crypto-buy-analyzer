import { NextRequest } from 'next/server';

interface FearGreedData {
    value: string;
    value_classification: string;
    timestamp: string;
    time_until_update: string;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
    const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
    if (!COINMARKETCAP_API_KEY) {
        return Response.json({ error: 'CoinMarketCap API key not set' }, { status: 500 });
    }

    try {
        console.log('🔄 Making fresh API calls at:', new Date().toISOString());

        // Add timestamp to URL to prevent any URL-based caching
        const timestamp = Date.now();

        // 1. Fetch from CoinMarketCap
        const fngResponse = await fetch(
            `https://pro-api.coinmarketcap.com/v3/fear-and-greed/historical?limit=1&_t=${timestamp}`,
            {
                headers: {
                    'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY!,
                    'Cache-Control': 'no-cache',
                },
                cache: 'no-store',
            }
        );

        // 2. Fetch from Alternative.me (in parallel)
        const altResponse = await fetch(`https://api.alternative.me/fng/?_t=${timestamp}`, {
            cache: 'no-store',
        });

        // Process CoinMarketCap response
        let cmcData = null;
        if (fngResponse.ok) {
            const fngJson = await fngResponse.json();
            console.log('📊 Raw CoinMarketCap response:', JSON.stringify(fngJson, null, 2));

            const dataArray = fngJson?.data || [];
            const fearGreed: FearGreedData | null = dataArray[dataArray.length - 1] ?? dataArray[0] ?? null;

            if (fearGreed) {
                cmcData = {
                    value: parseInt(fearGreed.value),
                    classification: fearGreed.value_classification,
                    timestamp: fearGreed.timestamp,
                    timestampDate: new Date(parseInt(fearGreed.timestamp) * 1000).toISOString(),
                };
                console.log('📈 CoinMarketCap Fear & Greed data:', cmcData);
            }
        } else {
            console.error('❌ CoinMarketCap API error:', fngResponse.status, fngResponse.statusText);
        }

        // Process Alternative.me response
        let altData = null;
        if (altResponse.ok) {
            const altJson = await altResponse.json();
            console.log('📊 Raw Alternative.me response:', JSON.stringify(altJson, null, 2));

            const altFearGreed = altJson?.data?.[0];
            if (altFearGreed) {
                altData = {
                    value: parseInt(altFearGreed.value),
                    classification: altFearGreed.value_classification,
                    timestamp: altFearGreed.timestamp,
                    timestampDate: new Date(parseInt(altFearGreed.timestamp) * 1000).toISOString(),
                };
                console.log('📈 Alternative.me Fear & Greed data:', altData);
            }
        } else {
            console.error('❌ Alternative.me API error:', altResponse.status, altResponse.statusText);
        }

        // Ensure we have at least one data source
        if (!cmcData && !altData) {
            throw new Error('No fear & greed data available from any source');
        }

        // Create response with strong cache prevention
        const response = Response.json({
            fearGreedIndex: cmcData || {
                value: null,
                classification: null,
                timestamp: null,
            },
            alternativeFearGreed: altData || {
                value: null,
                classification: null,
                timestamp: null,
            },
            debug: {
                fetchedAt: new Date().toISOString(),
                cmcSuccess: !!cmcData,
                altSuccess: !!altData,
            }
        });

        // Aggressive cache prevention
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');
        response.headers.set('X-Accel-Expires', '0');

        return response;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ API Error:', message);
        return Response.json({ error: message }, { status: 500 });
    }
}
