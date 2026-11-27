'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { CheckCircle, Banknote, Ticket } from 'lucide-react'
import EventShareActions from '@/components/EventShareActions'
import CopyButton from '../../verify-booking/CopyButton'
import { Event } from '@/types/event'
import { getEventRegistrationFields } from '@/lib/registrationFields'
import { PRIVATE_CANDIDATE_OPTION, SCHOOL_NOT_FOUND_OPTION } from '@/lib/schoolDirectory'
import {
  buildEventBookingResolverSchema,
  type EventBookingFormValues,
} from '@/lib/validation/eventBooking'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { ConsentCheckbox } from '@/components/legal/ConsentCheckbox'

export default function BookingForm({ event, schools }: { event: Event; schools: string[] }) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)
  const [submissionWarning, setSubmissionWarning] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [agreedToPolicies, setAgreedToPolicies] = useState(false)

  const defaultRegistrationFields = getEventRegistrationFields(event)
  const customFormFields = Array.isArray(event.customFormFields) ? event.customFormFields : []

  const bookingSchema = useMemo(() => {
    const registration = getEventRegistrationFields(event)
    const fields = Array.isArray(event.customFormFields) ? event.customFormFields : []
    return buildEventBookingResolverSchema(registration, fields)
  }, [event])

  const form = useForm<EventBookingFormValues>({
    resolver: standardSchemaResolver(bookingSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      schoolSelection: '',
      customSchool: '',
      category: '',
      information: '',
      customAnswers: {},
    },
  })

  const categoryValue = form.watch('category')
  const schoolSelection = form.watch('schoolSelection')

  const hasCategories = Boolean(event.categories && event.categories.length > 0)
  const showCategory = hasCategories && defaultRegistrationFields.category.enabled
  const hasSelectedCategory = !showCategory || Boolean(categoryValue.trim())
  const selectedCategory = event.categories?.find(
    (category) => category.name.toLowerCase() === categoryValue.trim().toLowerCase(),
  )
  const payableAmount =
    event.isPaid && selectedCategory?.amount != null && selectedCategory.amount > 0
      ? selectedCategory.amount
      : hasCategories
        ? null
        : event.amount

  const normalizedSchool = (values: EventBookingFormValues) =>
    values.schoolSelection === SCHOOL_NOT_FOUND_OPTION ? values.customSchool.trim() : values.schoolSelection.trim()

  const onSubmit = async (values: EventBookingFormValues) => {
    setSubmitError('')
    if (!agreedToPolicies) {
      setSubmitError('Please agree to the Terms & Conditions and Privacy Policy to continue.')
      return
    }
    try {
      const { createBooking, initiatePaidEventCheckout } = await import('../actions')
      const eventId = event.id

      const payload = {
        eventId,
        name: values.name.trim(),
        school: normalizedSchool(values),
        email: values.email.trim(),
        phone: values.phone.trim(),
        category: values.category.trim(),
        information: values.information.trim(),
        customAnswers: values.customAnswers ?? {},
      }

      if (event.isPaid) {
        const result = await initiatePaidEventCheckout(payload)
        if (result.success && result.checkoutUrl) {
          window.location.assign(result.checkoutUrl)
          return
        }
        setSubmitError(result.error || 'Failed to submit registration. Please try again.')
        return
      }

      const result = await createBooking(payload)
      if (result.success) {
        // Keep the confirmation on screen until the student chooses to leave it —
        // it is often the only place they see their registration ID.
        setIsSubmitted(true)
        setRegistrationId(result.registrationId ?? null)
        setSubmissionWarning(result.warning ?? null)
        form.reset({
          name: '',
          email: '',
          phone: '',
          schoolSelection: '',
          customSchool: '',
          category: '',
          information: '',
          customAnswers: {},
        })
        setAgreedToPolicies(false)
      } else {
        setSubmitError(result.error || 'Failed to submit registration. Please try again.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setSubmitError('An unexpected error occurred. Please try again.')
    }
  }

  const isLoading = form.formState.isSubmitting
  const disabledReason =
    event.isPaid && !hasSelectedCategory
      ? 'Choose a category above to see your fee.'
      : !agreedToPolicies
        ? 'Tick the agreement box above to continue.'
        : null

  if (isSubmitted) {
    const pageUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : ''
    const passHref = registrationId
      ? `/verify-booking?registrationId=${encodeURIComponent(registrationId)}`
      : null

    return (
      <Card className="border-2 border-green-200 shadow-lg" role="status">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">You&apos;re registered! 🎉</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-2">
            Your registration for <strong className="text-[#1f3a6f]">{event.title}</strong> is confirmed.
          </p>

          {registrationId ? (
            <div className="my-4 rounded-xl border border-dashed border-[#1f3a6f]/30 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Your registration ID — save this
              </p>
              <div className="mt-1 flex items-center justify-center">
                <span className="font-mono text-lg font-bold text-slate-900 break-all">{registrationId}</span>
                <CopyButton text={registrationId} label="Registration ID" />
              </div>
            </div>
          ) : null}

          {passHref ? (
            <Button asChild className="mb-4 w-full bg-[#1f3a6f] text-white hover:bg-[#14264a]">
              <Link href={passHref} prefetch={false}>
                <Ticket className="size-4" aria-hidden />
                View my event pass
              </Link>
            </Button>
          ) : null}

          {pageUrl ? (
            <div className="mb-4 text-left">
              <p className="mb-2 text-xs font-semibold text-slate-600">Don&apos;t forget it — add it to your calendar or invite a friend:</p>
              <EventShareActions
                event={{
                  title: event.title,
                  date: event.date,
                  time: event.time,
                  location: event.location,
                  venue: event.venue,
                  description: event.description,
                }}
                pageUrl={pageUrl}
                shareText={`I just registered for ${event.title} with Robonauts! Join me:`}
              />
            </div>
          ) : null}
          {submissionWarning ? (
            <Alert className="mt-4 border-amber-200 bg-amber-50 text-left">
              <AlertTitle className="text-amber-900">Heads up — confirmation email not delivered</AlertTitle>
              <AlertDescription className="text-amber-800">{submissionWarning}</AlertDescription>
            </Alert>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-gray-500">
                A confirmation email with event details has been sent to your email address. Please check your inbox
                (and spam folder).
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                If you don&apos;t see it in a few minutes, check your spam or junk folder.
              </p>
            </>
          )}

          <Button
            type="button"
            variant="ghost"
            className="mt-4 text-sm text-slate-600"
            onClick={() => {
              setIsSubmitted(false)
              setRegistrationId(null)
              setSubmissionWarning(null)
            }}
          >
            Register another student
          </Button>
        </CardContent>
      </Card>
    )
  }

  const inputClass = (invalid: boolean) =>
    cn(
      'border-2 rounded-lg py-3 h-auto md:text-base',
      invalid ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300',
    )

  return (
    <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-5 sm:p-7 pb-0">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Registration Form</h3>
        <p className="text-xs sm:text-sm text-gray-500">{event.title}</p>
      </CardHeader>
      <CardContent className="p-5 sm:p-7 pt-4 sm:pt-6">
        {event.isPaid && (
          <Alert className="mb-5 border-2 border-amber-300 bg-amber-50 shadow-sm">
            <Banknote className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800 uppercase tracking-wide">Registration Fee</AlertTitle>
            <AlertDescription>
              <p className="text-2xl sm:text-3xl font-bold text-amber-700">
                {payableAmount != null ? `BDT ${payableAmount}` : 'Select a category to see the fee'}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                You will be redirected to bKash secure checkout after submitting this form.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      autoComplete="name"
                      placeholder="Student's full name"
                      disabled={isLoading}
                      className={inputClass(!!fieldState.error)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showCategory && (
              <FormField
                control={form.control}
                name="category"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="category">
                      Category{' '}
                      {defaultRegistrationFields.category.required && <span className="text-red-500">*</span>}
                    </FormLabel>
                    <FormControl>
                      <select
                        id="category"
                        disabled={isLoading}
                        className={cn(
                          'flex h-auto w-full rounded-lg border-2 bg-transparent px-4 py-3 text-base shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                          fieldState.error ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300',
                        )}
                        {...field}
                      >
                        <option value="">Select category</option>
                        {event.categories?.map((category) => (
                          <option key={category.name} value={category.name}>
                            {event.isPaid && category.amount != null
                              ? `${category.name} - BDT ${category.amount}`
                              : category.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {defaultRegistrationFields.school.enabled && (
              <>
                <FormField
                  control={form.control}
                  name="schoolSelection"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel htmlFor="school">
                        School{' '}
                        {defaultRegistrationFields.school.required && <span className="text-red-500">*</span>}
                        <span className="block text-xs font-normal text-slate-500">
                          Not in a school? Choose &ldquo;{PRIVATE_CANDIDATE_OPTION}&rdquo;. Can&apos;t find yours? Pick the last option and type it.
                        </span>
                      </FormLabel>
                      <FormControl>
                        <select
                          id="school"
                          disabled={isLoading}
                          className={cn(
                            'flex h-auto w-full rounded-lg border-2 bg-transparent px-4 py-3 text-base shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                            fieldState.error ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300',
                          )}
                          {...field}
                        >
                          <option value="">Select school</option>
                          <option value={PRIVATE_CANDIDATE_OPTION}>{PRIVATE_CANDIDATE_OPTION}</option>
                          {schools.map((school) => (
                            <option key={school} value={school}>
                              {school}
                            </option>
                          ))}
                          <option value={SCHOOL_NOT_FOUND_OPTION}>School not found (type manually)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {schoolSelection === SCHOOL_NOT_FOUND_OPTION && (
                  <FormField
                    control={form.control}
                    name="customSchool"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Type your school name"
                            disabled={isLoading}
                            className={inputClass(false)}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="email">
                    Email address <span className="text-red-500">*</span>
                    <span className="block text-xs font-normal text-slate-500">
                      Your confirmation and event pass will be sent here.
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      disabled={isLoading}
                      className={inputClass(!!fieldState.error)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="01XXXXXXXXX (11 digits starting with 01)"
                      disabled={isLoading}
                      className={inputClass(!!fieldState.error)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {defaultRegistrationFields.information.enabled && (
              <FormField
                control={form.control}
                name="information"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel htmlFor="information">
                      Other Information
                      {defaultRegistrationFields.information.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="information"
                        rows={4}
                        disabled={isLoading}
                        placeholder="Any additional information you'd like to share (optional)..."
                        className={cn(
                          'min-h-[100px] resize-none border-2 rounded-lg py-3 md:text-base',
                          fieldState.error ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {customFormFields.length > 0 && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-800">Additional Information</p>
                {customFormFields.map((field) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`customAnswers.${field.id}`}
                    render={({ field: f, fieldState }) => {
                      const strVal = typeof f.value === 'string' ? f.value : ''
                      const arrVal = Array.isArray(f.value) ? f.value : []

                      return (
                        <FormItem>
                          <FormLabel htmlFor={`custom-${field.id}`}>
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                          </FormLabel>
                          <FormControl>
                            {field.type === 'longText' ? (
                              <Textarea
                                id={`custom-${field.id}`}
                                rows={3}
                                disabled={isLoading}
                                placeholder={field.placeholder || 'Enter your answer'}
                                className={cn(
                                  'min-h-[80px] resize-none border-2 rounded-lg py-3 md:text-base',
                                  fieldState.error
                                    ? 'border-red-400 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300',
                                )}
                                value={strVal}
                                onChange={(e) => f.onChange(e.target.value)}
                                onBlur={f.onBlur}
                                name={f.name}
                                ref={f.ref}
                              />
                            ) : field.type === 'select' ? (
                              <select
                                id={`custom-${field.id}`}
                                disabled={isLoading}
                                className={cn(
                                  'flex h-auto w-full rounded-lg border-2 bg-transparent px-4 py-3 text-base shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                  fieldState.error
                                    ? 'border-red-400 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300',
                                )}
                                value={strVal}
                                onChange={(e) => f.onChange(e.target.value)}
                                onBlur={f.onBlur}
                                name={f.name}
                                ref={f.ref}
                              >
                                <option value="">Select an option</option>
                                {(field.options ?? []).map((option) => (
                                  <option key={`${field.id}-${option}`} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : field.type === 'radio' ? (
                              <div className="space-y-2">
                                {(field.options ?? []).map((option) => (
                                  <label
                                    key={`${field.id}-${option}`}
                                    className="flex items-center gap-2 text-sm text-gray-700"
                                  >
                                    <input
                                      type="radio"
                                      name={f.name}
                                      value={option}
                                      checked={f.value === option}
                                      onChange={() => f.onChange(option)}
                                      onBlur={f.onBlur}
                                      disabled={isLoading}
                                    />
                                    {option}
                                  </label>
                                ))}
                              </div>
                            ) : field.type === 'checkbox' ? (
                              <div className="space-y-2">
                                {(field.options ?? []).map((option) => {
                                  const normalized = option.trim()
                                  const checked = arrVal.includes(normalized)
                                  return (
                                    <label
                                      key={`${field.id}-${option}`}
                                      className="flex items-center gap-2 text-sm text-gray-700"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => {
                                          const next = [...arrVal]
                                          if (e.target.checked && !next.includes(normalized)) {
                                            next.push(normalized)
                                          }
                                          if (!e.target.checked) {
                                            const i = next.indexOf(normalized)
                                            if (i !== -1) next.splice(i, 1)
                                          }
                                          f.onChange(next)
                                        }}
                                        disabled={isLoading}
                                      />
                                      {option}
                                    </label>
                                  )
                                })}
                              </div>
                            ) : (
                              <Input
                                id={`custom-${field.id}`}
                                type={
                                  field.type === 'email'
                                    ? 'email'
                                    : field.type === 'number'
                                      ? 'number'
                                      : field.type === 'phone'
                                        ? 'tel'
                                        : 'text'
                                }
                                disabled={isLoading}
                                placeholder={field.placeholder || 'Enter your answer'}
                                className={inputClass(!!fieldState.error)}
                                value={strVal}
                                onChange={(e) => f.onChange(e.target.value)}
                                onBlur={f.onBlur}
                                name={f.name}
                                ref={f.ref}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
            )}

            <ConsentCheckbox
              id={`consent-${event.id}`}
              checked={agreedToPolicies}
              onCheckedChange={setAgreedToPolicies}
              disabled={isLoading}
              showRefund={Boolean(event.isPaid)}
            />

            {!isLoading && disabledReason ? (
              <p id={`submit-hint-${event.id}`} className="text-center text-xs text-slate-500">
                {disabledReason}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={isLoading || Boolean(disabledReason)}
              aria-describedby={disabledReason ? `submit-hint-${event.id}` : undefined}
              className="w-full bg-[#d4163f] hover:bg-[#e8335a] text-white shadow-md hover:shadow-lg py-6 text-sm sm:text-base font-semibold"
            >
              {isLoading ? 'Submitting...' : event.isPaid ? 'Proceed to bKash payment' : 'Register now'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
