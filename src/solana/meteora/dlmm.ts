import DLMM from "@meteora-ag/dlmm";
import { PublicKey } from "@solana/web3.js";
import {connection} from "@/solana/network";

// todo: move to .env / config file
const meteoraPoolPublicKey = new PublicKey("CgqwPLSFfht89pF5RSKGUUMFj5zRxoUt4861w2SkXaqY"); // https://www.meteora.ag/dlmm/CgqwPLSFfht89pF5RSKGUUMFj5zRxoUt4861w2SkXaqY?referrer=home

// Get DLMM pool instance
const dlmmPool = await DLMM.create(connection, meteoraPoolPublicKey);

export default dlmmPool;
