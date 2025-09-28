import z from 'zod';

export type OhlcvParams = {
    network: string;
	poolKey: string;
	timeframe: 'day' | 'hour' | 'minute';
};

export type OhlcvOptions = {
	/**
	 * Possible values:
	 * - timeframe: 'day' -> 1
	 * - timeframe: 'hour' -> 1, 4, 12
	 * - timeframe: 'minute' -> 1, 5, 15
	 */
	aggregate?: number;

	/**
	 * Include empty intervals in the response (default: false)
	 */
	includeEmptyIntervals?: boolean;

	/**
	 * Limit number of ohlcv results to return (default: 100, max: 1000)
	 */
	limit?: number;

	/**
	 * Currency to return the ohlcv in (default: usd)
	 */
	currency?: 'usd' | 'token';

	/**
	 * Return ohlcv for base or quote token; use this to invert the chart. (default: base)
	 * Example: in a pool $MESSI/$SOL, by default the base is $MESSI and the quote is $SOL
	 * Set token: 'quote' to get the ohlcv for $SOL.
	 */
	token?: 'base' | 'quote' | (string & {});
};

export const OhlcvResponse = z.object({
	data: z.object({
		id: z.uuid(),
		type: z.literal('ohlcv_request_response'),
		attributes: z.object({
			ohlcv_list: z.array(
				z.tuple([
					z.number(), // UNIX timestamp
					z.number(), // open price USD
					z.number(), // high price USD
					z.number(), // low price USD
					z.number(), // close price USD
					z.number(), // volume USD
				]),
			),
		}),
	}),
});
export type OhlcvResponse = z.output<typeof OhlcvResponse>;
