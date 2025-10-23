import { Connection } from '@solana/web3.js';
import {mainnet} from "@solana/kit";

// Here we set up solana RPC using Helius API key
// Solana Mainnet
const heliusApiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
const mainnetURL = mainnet(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`);
export const connection = new Connection(mainnetURL);
