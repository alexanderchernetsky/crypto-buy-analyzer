import z from 'zod';

export type PoolTradesParams = {
	poolKey: string;
};

export type PoolTradesOptions = {
	tradeVolumeInUsdGreaterThan: number;
	token: 'base' | 'quote' | (string & {});
};

export const PoolTradesResponse = z.object({
	data: z.array(
		z.object({
			id: z.string(),
			type: z.literal('trade'),
			attributes: z.object({
				kind: z.enum(['buy', 'sell']),
				tx_hash: z.string(),
				tx_from_address: z.string(),
				block_number: z.int(),
				block_timestamp: z.iso.datetime(),
				from_token_address: z.string(),
				from_token_amount: z.string(),
				price_from_in_currency_token: z.string(),
				price_from_in_usd: z.string(),
				to_token_address: z.string(),
				to_token_amount: z.string(),
				price_to_in_currency_token: z.string(),
				price_to_in_usd: z.string(),
				volume_in_usd: z.string(),
			}),
		}),
	),
});
export type PoolTradesResponse = z.output<typeof PoolTradesResponse>;
