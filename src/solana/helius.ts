import { createHelius } from 'helius-sdk';

if (!process.env.NEXT_PUBLIC_HELIUS_API_KEY) {
    throw new Error('Missing NEXT_PUBLIC_HELIUS_API_KEY');
}

const helius = createHelius({
    apiKey: process.env.NEXT_PUBLIC_HELIUS_API_KEY
});

export default helius;
