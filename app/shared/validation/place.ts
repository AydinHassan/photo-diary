import { z } from 'zod'

export const placeSchema = z.object({
  name: z.string().trim().min(5, 'Name too short').max(100, 'Name too long'),
  description: z.string().trim().max(2000, 'Description too long').optional(),
  tags: z.array(z.string()).default([]),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),

})


export type PlaceSchema = z.infer<typeof placeSchema>
