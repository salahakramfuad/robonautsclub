import Script from 'next/script'
import { getOrganizationSchema } from '@/lib/seo'

export default function OrganizationSchema() {
  const schema = getOrganizationSchema()
  
  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

