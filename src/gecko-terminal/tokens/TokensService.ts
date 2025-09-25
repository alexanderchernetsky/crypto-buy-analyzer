import type Fetcher from '../Fetcher';
import TokenInfo from './schemas/TokenInfo';

export default class TokensService {
	readonly #fetcher: Fetcher;

	constructor(fetcher: Fetcher) {
		this.#fetcher = fetcher;
	}

	async info(mintKey: string) {
		return this.#fetcher.call(`/networks/solana/tokens/${mintKey}/info`, {
			schema: TokenInfo,
		});
	}
}
