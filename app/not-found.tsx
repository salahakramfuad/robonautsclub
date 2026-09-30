import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import NotFoundClient from '@/components/NotFoundClient'

export default async function NotFound() {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NotFoundClient />
    </NextIntlClientProvider>
  )
}
