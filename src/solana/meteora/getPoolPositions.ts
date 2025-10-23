import {PublicKey} from "@solana/web3.js";
import dlmmPool from "@/solana/meteora/dlmm";

// todo: move to .env / config file
const userPublicKey = new PublicKey("TjseHm44Ai5H3VNTEzEn7wxCxgw8qMudzWgMQSNybnV"); // Meteora Phantom Wallet PK

// todo: this can be used to get: 1.balance SOL and USDC; 2. Balance in USD; 3.total claimed rewards;
export async function getPoolPositions() {
    // Get user's positions
    const userPositions = await dlmmPool.getPositionsByUserAndLbPair(userPublicKey);
    console.log('userPositions', userPositions);

    const positions = [];


    // todo: move this to a separate fn which processes the data from Meteora and calculates balance in USD and claimed rewards in USD;
    // For each position, get the amounts
    for (const position of userPositions.userPositions) {
        const amountsX = position.positionData.totalXAmount; // Token A (e.g., SOL)
        const amountsY = position.positionData.totalYAmount; // Token B (e.g., USDC)

        positions.push({
            sol: Number(amountsX) / 1e9,
            usdc: Number(amountsY) / 1e6
        });
    }

    console.log('positions', positions);

    return positions;
}
