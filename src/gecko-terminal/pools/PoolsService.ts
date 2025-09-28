import type Fetcher from '../Fetcher';
import { type OhlcvOptions, type OhlcvParams, OhlcvResponse } from './schemas/Ohlcv';
import { type PoolInfoOptions, type PoolInfoParams, PoolInfoResponse } from './schemas/PoolInfo';
import { type PoolTradesOptions, type PoolTradesParams, PoolTradesResponse } from './schemas/PoolTrades';
import {NetworksResponse} from "@/gecko-terminal/networks/schema/NetworksResponse";

export default class PoolsService {
	readonly #fetcher: Fetcher;

	constructor(fetcher: Fetcher) {
		this.#fetcher = fetcher;
	}

	async info(params: PoolInfoParams, options?: PoolInfoOptions) {
		const url = await this.#fetcher.url(`/networks/solana/pools/${params.poolKey}`);

		return this.#fetcher.call(url, {
			schema: PoolInfoResponse,
			...options,
		});
	}

	async ohlcv(params: OhlcvParams, options?: OhlcvOptions) {
		const url = await this.#fetcher.url(`networks/${params.network}/pools/${params.poolKey}/ohlcv/${params.timeframe}`);

		if (typeof options?.aggregate === 'number') {
			url.searchParams.set('aggregate', options.aggregate.toString());
		}

        if (typeof options?.limit === 'number') {
            url.searchParams.set('limit', options.limit.toString());
        }

		if (typeof options?.includeEmptyIntervals === 'boolean') {
			url.searchParams.set('include_empty_intervals', options.includeEmptyIntervals.toString());
		}

		return this.#fetcher.call(url, {
			schema: OhlcvResponse,
			...options,
		});
	}

	async trades(params: PoolTradesParams, options?: PoolTradesOptions) {
		const url = await this.#fetcher.url(`/networks/solana/pools/${params.poolKey}/trades`);

		return this.#fetcher.call(url, {
			schema: PoolTradesResponse,
			...options,
		});
	}

    async networks() {
        const url = await this.#fetcher.url(`/networks`);

        return this.#fetcher.call(url, {
            schema: NetworksResponse,
        });
    }
}
