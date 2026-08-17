import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { LangToggle, ThemeToggle } from '@/components/ui/Toggles'
import { KeyboardDivider } from '@/components/motion/KeyboardDivider'
import { Reveal } from '@/components/motion/Reveal'
import { useLang } from '@/i18n/language-context'

const SWATCHES = [
  ['--bg', 'bg'],
  ['--bg-elevated', 'bg-elevated'],
  ['--surface', 'surface'],
  ['--surface-hover', 'surface-hover'],
  ['--border', 'border'],
  ['--border-strong', 'border-strong'],
  ['--text', 'text'],
  ['--text-muted', 'text-muted'],
  ['--text-subtle', 'text-subtle'],
  ['--accent', 'accent'],
  ['--accent-hover', 'accent-hover'],
  ['--danger', 'danger'],
  ['--success', 'success'],
] as const

/**
 * Internal reference page — every primitive in one place.
 *
 * Its job is to make theme drift obvious: flip the theme and language
 * toggles here and any component that hard-coded a colour or broke under
 * longer English strings shows up immediately.
 */
export default function StyleGuide() {
  const { t, lang } = useLang()

  return (
    <div className="min-h-dvh bg-bg text-text">
      <header className="sticky top-0 z-50 border-b border-border bg-bg-elevated/85 backdrop-blur-md">
        <div className="content-frame flex items-center justify-between py-4">
          <div>
            <p className="eyebrow">Ivory &amp; Midnight</p>
            <h1 className="display-md">Style guide</h1>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="content-frame flex flex-col gap-20 py-16">
        <Section title="Colour tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {SWATCHES.map(([token, label]) => (
              <div key={token} className="flex flex-col gap-2">
                <div
                  className="h-16 rounded-md border border-border"
                  style={{ background: `var(${token})` }}
                />
                <code className="text-xs text-muted">{label}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography">
          <div className="flex flex-col gap-6">
            <p className="eyebrow">Eyebrow label · 前置標題</p>
            <h2 className="display-xl">鋼琴教學 Piano</h2>
            <h3 className="display-lg">課程簡介 Courses</h3>
            <h4 className="display-md">自我介紹 About me</h4>
            <p className="measure text-muted">
              {lang === 'zh'
                ? '音樂不只是技巧，而是一種表達方式。我希望每位學生都能在鋼琴前找到屬於自己的聲音，無論是初學的小朋友，還是重拾興趣的成年人。'
                : 'Music is not only technique, it is a way of speaking. I want every student to find their own voice at the piano — whether a child just starting out or an adult returning to it.'}
            </p>
            <p className="text-sm text-subtle">
              Subtle caption text · 細節說明文字
            </p>
          </div>
        </Section>

        <Section title="Chinese face — 霞鶩文楷 LXGW WenKai TC">
          <div className="flex flex-col gap-5">
            <p className="text-sm text-muted">
              Latin comes from Cormorant Garamond / Inter; only CJK falls to WenKai. If a line
              of English below suddenly looks like a 楷體, the font stack order has been broken.
            </p>
            <p className="font-display text-5xl">鋼琴教學 Piano</p>
            <p className="font-display text-3xl">課程簡介 · Courses</p>
            <p className="text-base">
              我相信每一位學生的節奏都不一樣。有人喜歡古典，有人偏愛流行。
            </p>
            <p className="text-sm text-muted">
              ABRSM 一級至八級 · HK$550 每堂 · 45 分鐘
            </p>
            <p className="shimmer-text font-display text-4xl">
              讓每個人都彈出自己的聲音
            </p>
            <p className="text-xs text-subtle">
              ↑ the hero shimmer, running standalone
            </p>
          </div>
        </Section>

        <Section title="Keyboard divider">
          <KeyboardDivider />
          <p className="mt-3 text-sm text-muted">Hover the keys — they depress.</p>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">{t('heroCta')}</Button>
            <Button variant="secondary">{t('preview')}</Button>
            <Button variant="ghost">{t('cancel')}</Button>
            <Button variant="danger">{t('delete')}</Button>
            <Button loading>{t('saving')}</Button>
            <Button disabled>{t('save')}</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-6">
              <h4 className="display-md mb-2">Static</h4>
              <p className="text-sm text-muted">A plain surface card.</p>
            </Card>
            <Card interactive className="p-6">
              <h4 className="display-md mb-2">Interactive</h4>
              <p className="text-sm text-muted">Lifts and glows on hover.</p>
            </Card>
            <Card className="p-6">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </Card>
          </div>
        </Section>

        <Section title="Form controls">
          <div className="grid max-w-2xl gap-5">
            <Field label={t('contactName')} required>
              {({ id, describedBy, invalid }) => (
                <Input id={id} aria-describedby={describedBy} invalid={invalid} />
              )}
            </Field>
            <Field
              label={t('profileTagline')}
              hint={t('profileTaglineHint')}
              optionalLabel={t('optional')}
            >
              {({ id, describedBy, invalid }) => (
                <Input id={id} aria-describedby={describedBy} invalid={invalid} />
              )}
            </Field>
            <Field label={t('contactEmail')} error={t('contactInvalidEmail')} required>
              {({ id, describedBy, invalid }) => (
                <Input id={id} aria-describedby={describedBy} invalid={invalid} defaultValue="abc@" />
              )}
            </Field>
            <Field label={t('contactMessage')} required>
              {({ id, describedBy, invalid }) => (
                <Textarea id={id} aria-describedby={describedBy} invalid={invalid} />
              )}
            </Field>
          </div>
        </Section>

        <Section title="Motion">
          <Reveal>
            <Card className="p-6">
              <p className="text-sm text-muted">
                This card faded up on scroll. Enable “reduce motion” in your OS and it fades
                without moving.
              </p>
            </Card>
          </Reveal>
        </Section>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold tracking-[0.18em] uppercase text-subtle">
          {title}
        </h2>
        <div className="rule-fade flex-1" />
      </div>
      <div>{children}</div>
    </section>
  )
}
