import z from 'zod';

export const NetworksResponse = z.object({
	data: z.array(
		z.object({
			id: z.string(),
			type: z.string(),
			attributes: z.object({
				name: z.string(),
			}),
		}),
	),
});

export type NetworksResponse = z.output<typeof NetworksResponse>;
