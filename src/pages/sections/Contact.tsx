import { useState, type FormEvent } from 'react'
import { useLang } from '@/i18n/language-context'
import { useProfile, useSubmitEnquiry } from '@/hooks/useContent'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/motion/Reveal'

type Errors = Partial<Record<'name' | 'email' | 'message', string>>

export function Contact() {
  const { t, text } = useLang()
  const { data: profile } = useProfile()
  const submit = useSubmitEnquiry()

  const [values, setValues] = useState({ name: '', email: '', phone: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }))

  function validate(): boolean {
    const next: Errors = {}
    if (!values.name.trim()) next.name = t('contactRequired')
    if (!values.email.trim()) next.email = t('contactRequired')
    // Deliberately loose: the goal is to catch typos, not to police
    // which addresses are legitimate.
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = t('contactInvalidEmail')
    }
    if (!values.message.trim()) next.message = t('contactRequired')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    submit.mutate(values, {
      onSuccess: () => setValues({ name: '', email: '', phone: '', message: '' }),
    })
  }

  return (
    <section id="contact" className="section-pad scroll-mt-20 bg-bg-elevated">
      <div className="content-frame">
        <SectionHeading eyebrow={t('contactEyebrow')} title={t('navContact')} />

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
          <Reveal>
            {submit.isSuccess ? (
              <div
                role="status"
                className="rounded-lg border border-[var(--success)] bg-[var(--success-soft)] p-8"
              >
                <p className="font-display text-2xl">{t('contactSuccess')}</p>
                <Button
                  variant="secondary"
                  className="mt-6"
                  onClick={() => submit.reset()}
                >
                  {t('contactSubmit')}
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={t('contactName')} error={errors.name} required>
                    {({ id, describedBy, invalid }) => (
                      <Input
                        id={id}
                        name="name"
                        autoComplete="name"
                        value={values.name}
                        onChange={set('name')}
                        aria-describedby={describedBy}
                        invalid={invalid}
                      />
                    )}
                  </Field>

                  <Field label={t('contactEmail')} error={errors.email} required>
                    {({ id, describedBy, invalid }) => (
                      <Input
                        id={id}
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={values.email}
                        onChange={set('email')}
                        aria-describedby={describedBy}
                        invalid={invalid}
                      />
                    )}
                  </Field>
                </div>

                <Field label={t('contactPhoneOptional')}>
                  {({ id, describedBy }) => (
                    <Input
                      id={id}
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={values.phone}
                      onChange={set('phone')}
                      aria-describedby={describedBy}
                    />
                  )}
                </Field>

                <Field label={t('contactMessage')} error={errors.message} required>
                  {({ id, describedBy, invalid }) => (
                    <Textarea
                      id={id}
                      name="message"
                      rows={6}
                      value={values.message}
                      onChange={set('message')}
                      aria-describedby={describedBy}
                      invalid={invalid}
                    />
                  )}
                </Field>

                {submit.isError && (
                  <p role="alert" className="text-sm text-danger">
                    {t('contactError')}
                  </p>
                )}

                <div>
                  <Button type="submit" size="lg" loading={submit.isPending}>
                    {submit.isPending ? t('contactSending') : t('contactSubmit')}
                  </Button>
                </div>
              </form>
            )}
          </Reveal>

          <Reveal delay={0.12}>
            <div className="flex flex-col gap-6">
              <p className="eyebrow">{t('contactOrReach')}</p>

              <ul className="flex flex-col gap-1">
                {profile?.whatsapp && (
                  <ContactRow
                    href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
                    label="WhatsApp"
                    value={profile.phone ?? profile.whatsapp}
                    external
                  />
                )}
                {profile?.phone && (
                  <ContactRow
                    href={`tel:${profile.phone.replace(/\s/g, '')}`}
                    label={t('contactPhone')}
                    value={profile.phone}
                  />
                )}
                {profile?.email && (
                  <ContactRow
                    href={`mailto:${profile.email}`}
                    label={t('contactEmail')}
                    value={profile.email}
                  />
                )}
                {profile?.instagram && (
                  <ContactRow
                    href={`https://instagram.com/${profile.instagram.replace(/^@/, '')}`}
                    label="Instagram"
                    value={`@${profile.instagram.replace(/^@/, '')}`}
                    external
                  />
                )}
              </ul>

              {text(profile, 'address') && (
                <div className="border-t border-border pt-6">
                  <p className="text-xs tracking-wide text-subtle uppercase">
                    {t('profileAddress')}
                  </p>
                  <p className="mt-1.5 text-muted">{text(profile, 'address')}</p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function ContactRow({
  href,
  label,
  value,
  external = false,
}: {
  href: string
  label: string
  value: string
  external?: boolean
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group flex items-baseline justify-between gap-4 border-b border-border py-3.5 transition-colors hover:border-accent-line"
      >
        <span className="text-sm text-subtle">{label}</span>
        <span className="text-right text-muted transition-colors group-hover:text-accent">
          {value}
        </span>
      </a>
    </li>
  )
}
