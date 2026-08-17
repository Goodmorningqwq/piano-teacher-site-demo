import { useState } from 'react'
import { useLang } from '@/i18n/language-context'
import { useInvalidateContent, useSettings } from '@/hooks/useContent'
import { saveSettings } from '@/lib/backend'
import { useToast } from '@/components/ui/Toast'
import { BilingualField } from '../components/BilingualField'
import { ImageDropzone } from '../components/ImageDropzone'
import { PanelHeader, PanelSection, SaveBar } from '../components/Panel'
import { useDraft } from '../useDraft'
import { cn } from '@/lib/cn'
import type { SiteSettings } from '@/lib/database.types'

export function SettingsPanel() {
  const { t } = useLang()
  const { data: settings } = useSettings()
  const { draft, setField, setBilingual, dirty, commit } = useDraft<SiteSettings>(settings)
  const invalidate = useInvalidateContent()
  const { showToast } = useToast()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    if (!draft) return
    setSaving(true)
    setError(null)
    try {
      await saveSettings({
        hero_headline_zh: draft.hero_headline_zh,
        hero_headline_en: draft.hero_headline_en,
        hero_sub_zh: draft.hero_sub_zh,
        hero_sub_en: draft.hero_sub_en,
        hero_image_url: draft.hero_image_url,
        default_theme: draft.default_theme,
        seo_title_zh: draft.seo_title_zh,
        seo_title_en: draft.seo_title_en,
        seo_description_zh: draft.seo_description_zh,
        seo_description_en: draft.seo_description_en,
      })

      commit()
      invalidate()
      showToast({ message: t('saved'), tone: 'success' })
    } catch (cause) {
      console.error('[admin] settings save failed:', cause)
      setError(t('saveError'))
    } finally {
      setSaving(false)
    }
  }

  if (!draft) return null

  return (
    <>
      <PanelHeader title={t('settingsTitle')} intro={t('settingsIntro')} />

      <div className="flex flex-col gap-5">
        <PanelSection>
          <BilingualField
            label={t('settingsHeroHeading')}
            zhValue={draft.hero_headline_zh ?? ''}
            enValue={draft.hero_headline_en ?? ''}
            onChange={(value) => setBilingual('hero_headline', value)}
          />
          <BilingualField
            label={t('settingsHeroSub')}
            multiline
            rows={2}
            zhValue={draft.hero_sub_zh ?? ''}
            enValue={draft.hero_sub_en ?? ''}
            onChange={(value) => setBilingual('hero_sub', value)}
          />
          <ImageDropzone
            label={t('settingsHeroImage')}
            bucket="course-images"
            aspect="landscape"
            value={draft.hero_image_url}
            onChange={(url) => setField('hero_image_url', url)}
          />
        </PanelSection>

        <PanelSection title={t('settingsDefaultTheme')}>
          <p className="text-xs text-muted">{t('settingsDefaultThemeHint')}</p>
          <div className="flex gap-2">
            {(['dark', 'light'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={draft.default_theme === option}
                onClick={() => setField('default_theme', option)}
                className={cn(
                  'inline-flex min-h-11 items-center gap-2 rounded-md border px-4 text-sm transition-colors',
                  draft.default_theme === option
                    ? 'border-accent bg-accent-soft text-accent font-medium'
                    : 'border-border text-muted hover:border-border-strong hover:text-text',
                )}
              >
                {t(option === 'dark' ? 'themeDark' : 'themeLight')}
              </button>
            ))}
          </div>
        </PanelSection>

        <PanelSection title={t('settingsSeoHeading')}>
          <BilingualField
            label={t('settingsSeoTitle')}
            zhValue={draft.seo_title_zh ?? ''}
            enValue={draft.seo_title_en ?? ''}
            onChange={(value) => setBilingual('seo_title', value)}
          />
          <BilingualField
            label={t('settingsSeoDescription')}
            hint={t('settingsSeoDescriptionHint')}
            multiline
            rows={3}
            zhValue={draft.seo_description_zh ?? ''}
            enValue={draft.seo_description_en ?? ''}
            onChange={(value) => setBilingual('seo_description', value)}
          />
        </PanelSection>
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={() => void save()} error={error} />
    </>
  )
}
