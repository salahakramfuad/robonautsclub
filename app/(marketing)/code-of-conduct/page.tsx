import { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/site-config'
import { PAGE_SEO, buildPageMetadata } from '@/lib/seo-metadata'
import { LEGAL_LAST_UPDATED } from '@/lib/legal'
import { LegalLink, LegalList, LegalPage, LegalSection } from '@/components/legal/LegalPage'

export const metadata: Metadata = buildPageMetadata({
  title: PAGE_SEO.codeOfConduct.title,
  description: PAGE_SEO.codeOfConduct.description,
  path: '/code-of-conduct',
  absoluteTitle: true,
})

export default function CodeOfConductPage() {
  const email = SITE_CONFIG.email
  return (
    <LegalPage
      title="Code of Conduct"
      lastUpdated={LEGAL_LAST_UPDATED}
      intro={
        <p>
          {SITE_CONFIG.name} wants every workshop, class, and competition to be safe, welcoming,
          and fair. This code applies to students, parents and guardians, mentors, coaches,
          volunteers, staff, and visitors, both at our events and online.
        </p>
      }
    >
      <LegalSection title="Respect and inclusion">
        <LegalList>
          <li>Treat everyone with courtesy, whatever their age, gender, religion, ethnicity, disability, school, or skill level.</li>
          <li>Harassment, bullying, threats, and discrimination are not allowed, whether in person, online, or in group chats.</li>
          <li>Use appropriate language and behaviour. Many participants are children.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Safety in labs and arenas">
        <LegalList>
          <li>Follow staff instructions when using tools, soldering irons, motors, and batteries (especially LiPo batteries).</li>
          <li>Wear safety gear whenever it is required, and keep your work area tidy.</li>
          <li>Report damaged equipment, injuries, or hazards to staff straight away.</li>
          <li>Do not bring dangerous items, and do not change venue equipment without permission.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Fair play">
        <LegalList>
          <li>Follow the rulebook for your category, as well as the judges&apos; and referees&apos; decisions.</li>
          <li>Students should do their own work. Mentors may guide them but should not build or program for them in the competition.</li>
          <li>Never tamper with or damage another team&apos;s robot or equipment.</li>
        </LegalList>
      </LegalSection>

      <LegalSection title="Child safety and safeguarding" id="safeguarding">
        <LegalList>
          <li>Adults should not be alone with a child out of sight of others. Work in open, visible spaces.</li>
          <li>Staff and volunteers must not contact participants privately for non-program reasons. Messages to minors should include a parent or guardian, or go through official channels.</li>
          <li>Parents and guardians are responsible for dropping off and picking up their children on time and for supervising them outside session hours.</li>
          <li>Do not photograph or film other people&apos;s children without permission, except for normal photos of your own child&apos;s team.</li>
        </LegalList>
        <p>
          <strong>Reporting a concern:</strong> if a child may be at risk, tell the nearest staff
          member right away, or email <LegalLink href={`mailto:${email}`}>{email}</LegalLink> or
          call <LegalLink href={`tel:${SITE_CONFIG.phone}`}>{SITE_CONFIG.phone}</LegalLink>. We
          treat every report seriously and confidentially. If someone is in immediate danger,
          call the Bangladesh emergency number <strong>999</strong>. The child helpline is{' '}
          <strong>1098</strong>.
        </p>
      </LegalSection>

      <LegalSection title="Photos and media">
        <p>
          Official photographers may take photos and videos at events, as described in our{' '}
          <LegalLink href="/privacy">Privacy Policy</LegalLink>. If you don&apos;t want your child
          to appear in published media, tell staff at check-in or email us.
        </p>
      </LegalSection>

      <LegalSection title="Online conduct">
        <p>
          The same standards apply in online classes, WhatsApp or Facebook groups, and on our
          social media. Do not share other people&apos;s personal information, spam, or post
          inappropriate content.
        </p>
      </LegalSection>

      <LegalSection title="Consequences">
        <p>
          Depending on how serious the breach is, we may give a warning, remove someone from a
          session or event, disqualify a team, ban someone from future programs, or report the
          matter to the authorities. Fees are not refunded in these cases (see our{' '}
          <LegalLink href="/refund-policy">Refund Policy</LegalLink>).
        </p>
      </LegalSection>
    </LegalPage>
  )
}
