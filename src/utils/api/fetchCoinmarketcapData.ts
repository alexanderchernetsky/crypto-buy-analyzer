interface FearGreedResponse {
    fearGreedIndex: {
        value: number;
        classification: string;
        timestamp: string;
    };
}

interface ApiError {
    error: string;
}

async function fetchCoinmarketcapData(): Promise<FearGreedResponse> {
    try {
        const response = await fetch('/api/crypto-indices', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData: ApiError = await response.json();
            throw new Error(`API Error: ${errorData.error || 'Unknown error'}`);
        }

        const data: FearGreedResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch data from Coinmarketcap api:', error);
        throw error;
    }
}

export default fetchCoinmarketcapData;
