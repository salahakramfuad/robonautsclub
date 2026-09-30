import { z } from 'zod'

export const galleryGroupFormSchema = z.object({
  title: z.string().trim().min(1, 'Album title is required'),
  titleBn: z.string().default(''),
  location: z.string(),
  locationBn: z.string().default(''),
  sortOrder: z.number().int(),
  displayDateInput: z.string().min(1, 'Display date is required'),
})

export type GalleryGroupFormValues = z.infer<typeof galleryGroupFormSchema>
