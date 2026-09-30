import { z } from 'zod'

/** Shared shape for create / edit course dialogs */
export const courseFormSchema = z.object({
  title: z.string().trim().min(1, 'Course title is required'),
  titleBn: z.string().default(''),
  level: z.string().trim().min(1, 'Level is required'),
  levelBn: z.string().default(''),
  blurb: z.string().trim().min(1, 'Blurb is required'),
  blurbBn: z.string().default(''),
  href: z.string(),
  image: z.string().trim().min(1, 'Course image is required'),
})

export type CourseFormValues = z.infer<typeof courseFormSchema>
