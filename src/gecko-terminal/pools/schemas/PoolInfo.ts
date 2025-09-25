import z from 'zod';

export type PoolInfoParams = {
	poolKey: string;
};

export type PoolInfoOptions = {
	token: 'base' | 'quote' | (string & {});
};

const TransactionsStats = z.object({
	buys: z.number(),
	sells: z.number(),
	buyers: z.number(),
	sellers: z.number(),
});

export const PoolInfoResponse = z
	.object({
		data: z.object({
			id: z.string(),
			type: z.literal('pool'),
			attributes: z.object({
				base_token_price_usd: z.string(),
				base_token_price_native_currency: z.string(),

				quote_token_price_usd: z.string(),
				quote_token_price_native_currency: z.string(),

				base_token_price_quote_token: z.string(),
				quote_token_price_base_token: z.string(),

				address: z.string(),
				name: z.string(),
				pool_name: z.string(),
				pool_fee_percentage: z.unknown().nullable(),
				pool_created_at: z.iso.datetime(),

				fdv_usd: z.coerce.number(),
				market_cap_usd: z.coerce.number().nullable(),

				price_change_percentage: z.object({
					m5: z.coerce.number(),
					m15: z.coerce.number(),
					m30: z.coerce.number(),
					h1: z.coerce.number(),
					h6: z.coerce.number(),
					h24: z.coerce.number(),
				}),

				transactions: z.object({
					m5: TransactionsStats,
					m15: TransactionsStats,
					m30: TransactionsStats,
					h1: TransactionsStats,
					h6: TransactionsStats,
					h24: TransactionsStats,
				}),

				volume_usd: z.object({
					m5: z.coerce.number(),
					m15: z.coerce.number(),
					m30: z.coerce.number(),
					h1: z.coerce.number(),
					h6: z.coerce.number(),
					h24: z.coerce.number(),
				}),

				reserve_in_usd: z.coerce.number().nonnegative(),
				locked_liquidity_percentage: z.coerce.number().nonnegative(),
			}),
		}),
	})
	.transform((data) => ({
		...data,
		data: {
			...data.data,
			attributes: {
				...data.data.attributes,
				base_token_price_usd_raw: data.data.attributes.base_token_price_usd,
				base_token_price_usd: parseFloat(data.data.attributes.base_token_price_usd),
				base_token_price_native_currency_raw: data.data.attributes.base_token_price_native_currency,
				base_token_price_native_currency: parseFloat(data.data.attributes.base_token_price_native_currency),

				quote_token_price_usd_raw: data.data.attributes.quote_token_price_usd,
				quote_token_price_usd: parseFloat(data.data.attributes.quote_token_price_usd),
				quote_token_price_native_currency_raw: data.data.attributes.quote_token_price_native_currency,
				quote_token_price_native_currency: parseFloat(data.data.attributes.quote_token_price_native_currency),

				base_token_price_quote_token_raw: data.data.attributes.base_token_price_quote_token,
				base_token_price_quote_token: parseFloat(data.data.attributes.base_token_price_quote_token),
				quote_token_price_base_token_raw: data.data.attributes.quote_token_price_base_token,
				quote_token_price_base_token: parseFloat(data.data.attributes.quote_token_price_base_token),

				market_cap_usd_raw: data.data.attributes.market_cap_usd ?? data.data.attributes.fdv_usd,
			},
		},
	}));

export type PoolInfoResponse = z.output<typeof PoolInfoResponse>;
