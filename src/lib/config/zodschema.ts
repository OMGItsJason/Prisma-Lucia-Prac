import { z } from 'zod';

export const validateSchema = z.object({
	username: z.string().trim().min(1),
	password: z.string().trim().min(1)
});

export type validateSchema = z.infer<typeof validateSchema>;
