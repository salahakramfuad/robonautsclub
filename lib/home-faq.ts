import { SITE_CONFIG } from '@/lib/site-config'

export type HomeFaqItem = {
  question: string
  answer: string
}

/** Shared homepage FAQ copy — keep in sync with FAQPage JSON-LD. */
export const HOME_FAQ_ITEMS: HomeFaqItem[] = [
  {
    question: `Who is eligible to join ${SITE_CONFIG.name}?`,
    answer: `${SITE_CONFIG.name} welcomes students from grades 3-12 who have an interest in robotics, STEM, and innovation. No prior experience is required for beginner courses.`,
  },
  {
    question: 'What age groups do you serve?',
    answer:
      'We serve students aged 8-18 years old, with courses tailored to different age groups and skill levels. Our programs are designed to grow with students from elementary through high school.',
  },
  {
    question: 'Do I need any background knowledge?',
    answer:
      'No background knowledge is required for our beginner courses. We start from the basics and guide you through every step. For intermediate and advanced courses, we recommend completing prerequisite courses first.',
  },
  {
    question: 'Do you provide certificates?',
    answer:
      'Yes! Students who complete our courses receive certificates of completion. We also provide certificates for participation in competitions and special workshops.',
  },
]
