'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useRouter } from '@/i18n/navigation'
import LanguageToggle from '@/components/LanguageToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

type FormValues = {
  password: string
  confirm: string
}

function ResetForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const schema = z
    .object({
      password: z.string().min(8, t('validation.passwordMin')),
      confirm: z.string().min(8),
    })
    .refine((v) => v.password === v.confirm, {
      message: t('validation.passwordMismatch'),
      path: ['confirm'],
    })

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { password: '', confirm: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: values.password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : t('errors.resetFailed'))
        return
      }
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setError(t('errors.resetRetry'))
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t('reset.missingToken')}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h1 className="text-xl font-semibold">{t('reset.title')}</h1>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {success ? (
          <Alert>
            <AlertDescription>{t('reset.success')}</AlertDescription>
          </Alert>
        ) : null}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reset.passwordLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reset.confirmLabel')}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading || success} className="w-full">
              {loading ? t('reset.saving') : t('reset.submit')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function ResetLoading() {
  const t = useTranslations('auth')
  return <div>{t('reset.loading')}</div>
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 relative">
      <div className="absolute top-4 right-4">
        <LanguageToggle variant="standalone" />
      </div>
      <div className="w-full max-w-md">
        <Suspense fallback={<ResetLoading />}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
