import { SITE_CONFIG } from '@/lib/site-config'

export type FAQItem = { question: string; answer: string }

/** General questions — shown on the homepage. */
export const GENERAL_FAQ: FAQItem[] = [
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

/** Practical registration questions — shown on the events page. Facts only; mirrors how the site works. */
export const EVENTS_FAQ: FAQItem[] = [
  {
    question: 'How do I register for an event?',
    answer:
      'Open the event, fill in the registration form with the student’s name, email and phone number, and submit. Free events are confirmed instantly; paid events take you to bKash to complete payment.',
  },
  {
    question: 'How do I pay for a paid event?',
    answer:
      'Payments are made securely through bKash. After you submit the form you are redirected to bKash checkout — stay on the page until you see the “Payment Successful” screen.',
  },
  {
    question: 'I lost my registration ID. What should I do?',
    answer: `Your registration ID is in your confirmation email and the attached PDF — search your inbox (and spam folder) for “Robonauts”. If you still can’t find it, message us on WhatsApp at ${SITE_CONFIG.phone} with the student’s name and the event, and we’ll resend it.`,
  },
  {
    question: 'Can I cancel or get a refund?',
    answer: 'Please see our Refund & Cancellation Policy, or message us on WhatsApp and we’ll help.',
  },
]

/** schema.org FAQPage JSON-LD for the given questions. */
export function faqPageSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}
