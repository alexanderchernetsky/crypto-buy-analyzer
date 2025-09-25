import Fetcher from './Fetcher';
import PoolsService from './pools/PoolsService';
import TokensService from './tokens/TokensService';

export default class GeckoTerminalClient {
	readonly #fetcher: Fetcher;
	readonly #tokens: TokensService;
	readonly #pools: PoolsService;

	constructor() {
		this.#fetcher = new Fetcher('https://api.geckoterminal.com/api/v2');
		this.#tokens = new TokensService(this.#fetcher);
		this.#pools = new PoolsService(this.#fetcher);
	}

	get tokens() {
		return this.#tokens;
	}

	get pools() {
		return this.#pools;
	}
}
