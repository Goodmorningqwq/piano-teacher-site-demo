import { useState } from 'react'
import { useLang } from '@/i18n/language-context'
import { useInvalidateContent, useProfile } from '@/hooks/useContent'
import { saveProfile } from '@/lib/backend'
import { Field, Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { BilingualField } from '../components/BilingualField'
import { ImageDropzone } from '../components/ImageDropzone'
import { PanelHeader, PanelSection, SaveBar } from '../components/Panel'
import { useDraft } from '../useDraft'
import type { Credential, Profile } from '@/lib/database.types'

export function ProfilePanel() {
  const { t } = useLang()
  const { data: profile } = useProfile()
  const { draft, setField, setBilingual, dirty, commit } = useDraft<Profile>(profile)
  const invalidate = useInvalidateContent()
  const { showToast } = useToast()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!draft) return
    setSaving(true)
    setError(null)
    try {
      await saveProfile({
        name_zh: draft.name_zh,
        name_en: draft.name_en,
        tagline_zh: draft.tagline_zh,
        tagline_en: draft.tagline_en,
        bio_zh: draft.bio_zh,
        bio_en: draft.bio_en,
        philosophy_zh: draft.philosophy_zh,
        philosophy_en: draft.philosophy_en,
        portrait_url: draft.portrait_url,
        credentials: draft.credentials,
        email: draft.email,
        phone: draft.phone,
        whatsapp: draft.whatsapp,
        instagram: draft.instagram,
        youtube: draft.youtube,
        address_zh: draft.address_zh,
        address_en: draft.address_en,
      })

      commit()
      invalidate()
      showToast({ message: t('saved'), tone: 'success' })
    } catch (cause) {
      console.error('[admin] profile save failed:', cause)
      setError(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  if (!draft) return null

  const credentials = draft.credentials ?? []

  const updateCredential = (index: number, patch: Partial<Credential>) => {
    const next = credentials.map((item, i) => (i === index ? { ...item, ...patch } : item))
    setField('credentials', next)
  }

  return (
    <>
      <PanelHeader title={t('profileTitle')} intro={t('profileIntro')} />

      <div className="flex flex-col gap-5">
        <PanelSection>
          <div className="grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
            <ImageDropzone
              label={t('profilePortrait')}
              bucket="portraits"
              aspect="portrait"
              value={draft.portrait_url}
              onChange={(url) => setField('portrait_url', url)}
            />

            <div className="flex flex-col gap-5">
              <BilingualField
                label={t('profileName')}
                required
                zhValue={draft.name_zh ?? ''}
                enValue={draft.name_en ?? ''}
                onChange={(value) => setBilingual('name', value)}
              />
              <BilingualField
                label={t('profileTagline')}
                hint={t('profileTaglineHint')}
                zhValue={draft.tagline_zh ?? ''}
                enValue={draft.tagline_en ?? ''}
                onChange={(value) => setBilingual('tagline', value)}
              />
            </div>
          </div>
        </PanelSection>

        <PanelSection>
          <BilingualField
            label={t('profileBio')}
            multiline
            rows={9}
            zhValue={draft.bio_zh ?? ''}
            enValue={draft.bio_en ?? ''}
            onChange={(value) => setBilingual('bio', value)}
          />
          <BilingualField
            label={t('profilePhilosophy')}
            multiline
            rows={3}
            zhValue={draft.philosophy_zh ?? ''}
            enValue={draft.philosophy_en ?? ''}
            onChange={(value) => setBilingual('philosophy', value)}
          />
        </PanelSection>

        <PanelSection title={t('profileCredentials')}>
          <div className="flex flex-col gap-3">
            {credentials.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-[110px_minmax(0,1fr)_auto]"
              >
                <Input
                  aria-label={t('profileCredentialYear')}
                  placeholder={t('profileCredentialYear')}
                  value={item.year}
                  onChange={(e) => updateCredential(index, { year: e.target.value })}
                />
                <div className="flex flex-col gap-2">
                  <Input
                    lang="zh-Hant"
                    aria-label={`${t('profileCredentialTitle')} — ${t('langZh')}`}
                    placeholder={t('langZh')}
                    value={item.title_zh}
                    onChange={(e) => updateCredential(index, { title_zh: e.target.value })}
                  />
                  <Input
                    lang="en"
                    aria-label={`${t('profileCredentialTitle')} — ${t('langEn')}`}
                    placeholder={t('langEn')}
                    value={item.title_en ?? ''}
                    onChange={(e) => updateCredential(index, { title_en: e.target.value })}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t('delete')}
                  onClick={() =>
                    setField(
                      'credentials',
                      credentials.filter((_, i) => i !== index),
                    )
                  }
                >
                  {t('delete')}
                </Button>
              </div>
            ))}

            <div>
              <Button
                variant="secondary"
                onClick={() =>
                  setField('credentials', [
                    ...credentials,
                    { year: '', title_zh: '', title_en: '' },
                  ])
                }
              >
                {t('profileAddCredential')}
              </Button>
            </div>
          </div>
        </PanelSection>

        <PanelSection title={t('profileContactHeading')}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t('contactEmail')}>
              {({ id }) => (
                <Input
                  id={id}
                  type="email"
                  value={draft.email ?? ''}
                  onChange={(e) => setField('email', e.target.value)}
                />
              )}
            </Field>
            <Field label={t('contactPhone')}>
              {({ id }) => (
                <Input
                  id={id}
                  type="tel"
                  value={draft.phone ?? ''}
                  onChange={(e) => setField('phone', e.target.value)}
                />
              )}
            </Field>
            <Field label={t('profileWhatsapp')} hint={t('profileWhatsappHint')}>
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  inputMode="numeric"
                  aria-describedby={describedBy}
                  value={draft.whatsapp ?? ''}
                  onChange={(e) => setField('whatsapp', e.target.value)}
                />
              )}
            </Field>
            <Field label={t('profileInstagram')}>
              {({ id }) => (
                <Input
                  id={id}
                  value={draft.instagram ?? ''}
                  onChange={(e) => setField('instagram', e.target.value)}
                />
              )}
            </Field>
            <Field label={t('profileYoutube')}>
              {({ id }) => (
                <Input
                  id={id}
                  type="url"
                  value={draft.youtube ?? ''}
                  onChange={(e) => setField('youtube', e.target.value)}
                />
              )}
            </Field>
          </div>

          <BilingualField
            label={t('profileAddress')}
            zhValue={draft.address_zh ?? ''}
            enValue={draft.address_en ?? ''}
            onChange={(value) => setBilingual('address', value)}
          />
        </PanelSection>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} error={error} />
    </>
  )
}
