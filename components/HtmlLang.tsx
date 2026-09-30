'use client'

import { useEffect } from 'react'

/** Syncs <html lang> for locale routes (root layout owns the html element). */
export default function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return null
}
