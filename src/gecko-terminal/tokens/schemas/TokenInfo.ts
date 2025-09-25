import z from 'zod';

const TokenInfo = z.object({
	data: z.object({
		id: z.string(),
		type: z.literal('token'),
		attributes: z.object({
			address: z.string(),
			name: z.string(),
			symbol: z.string(),
			decimals: z.number(),
			holders: z.object({
				count: z.int().nullable(),
			}),
		}),
	}),
});

export default TokenInfo;
