import type z from 'zod';

type CallOptions<TSchema extends z.ZodType> = RequestInit & {
	schema: TSchema;
};

export default class Fetcher {
	readonly #baseURL: string;
	/**
	 * @see https://api.geckoterminal.com/docs/index.html#:~:text=com/api/v2-,Versioning,-It%20is%20recommended
	 */
	readonly #version = '20230302';

	constructor(baseURL: string) {
		this.#baseURL = baseURL;
	}

	async url(path: string) {
		return new URL(`${this.#baseURL}/${path}`);
	}

	async call<TSchema extends z.ZodType>(
		path: URL | string,
		{ schema, ...options }: CallOptions<TSchema>,
	): Promise<z.output<TSchema>> {
		const url = path instanceof URL ? path : `${this.#baseURL}${path}`;
		const headers = new Headers(options.headers);
		headers.set('Accept', `application/json;version=${this.#version}`);

		const response = await fetch(url, {
			...options,
			headers,
		});

		const text = await response.text();
		let parsed: unknown;
		try {
			parsed = JSON.parse(text);
		} catch (error) {
			console.error('Cannot parse response as JSON', text, error);
			throw error;
		}

		return schema.parse(parsed);
	}
}
