import { useLang } from '@/i18n/language-context'
import { useCourses } from '@/hooks/useContent'
import { Card } from '@/components/ui/Card'
import { CourseIcon } from '@/components/ui/CourseIcon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Skeleton } from '@/components/ui/Skeleton'
import { RevealGroup, RevealItem } from '@/components/motion/Reveal'
import type { Course } from '@/lib/database.types'

export function Courses() {
  const { t } = useLang()
  const { data: courses, isPending } = useCourses()

  return (
    <section id="courses" className="section-pad scroll-mt-20 bg-bg-elevated">
      <div className="content-frame">
        <SectionHeading eyebrow={t('coursesEyebrow')} title={t('navCourses')} />

        {isPending ? (
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Card key={i} className="flex flex-col gap-4 p-7">
                <Skeleton className="size-10 rounded-md" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </Card>
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <RevealItem key={course.id} className="h-full">
                <CourseCard course={course} />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <p className="mt-14 text-muted">{t('coursesEmpty')}</p>
        )}
      </div>
    </section>
  )
}

function CourseCard({ course }: { course: Course }) {
  const { t, text } = useLang()

  const level = text(course, 'level')
  const priceNote = text(course, 'price_note')
  const hasFooter = course.duration_min != null || course.price != null

  const scrollToContact = () =>
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <Card
      interactive
      onClick={scrollToContact}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          scrollToContact()
        }
      }}
      aria-label={`${text(course, 'title')} — ${t('courseEnquire')}`}
      className="flex h-full flex-col gap-4 p-7"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-md bg-accent-soft text-accent">
        <CourseIcon name={course.icon} />
      </span>

      <div>
        <h3 className="font-display text-2xl leading-tight">{text(course, 'title')}</h3>
        {level && <p className="mt-1.5 text-xs tracking-wide text-accent">{level}</p>}
      </div>

      <p className="flex-1 text-sm leading-relaxed text-muted">{text(course, 'summary')}</p>

      {hasFooter && (
        <dl className="mt-1 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-sm">
          {course.duration_min != null && (
            <div>
              <dt className="text-xs text-subtle">{t('courseDuration')}</dt>
              <dd className="text-text">
                {course.duration_min} {t('courseMinutes')}
              </dd>
            </div>
          )}
          {course.price != null && (
            <div>
              <dt className="text-xs text-subtle">{t('coursePrice')}</dt>
              <dd className="text-text">
                HK${Number(course.price).toLocaleString('en-HK', {
                  maximumFractionDigits: 0,
                })}
                {priceNote && <span className="ml-1 text-xs text-subtle">{priceNote}</span>}
              </dd>
            </div>
          )}
        </dl>
      )}
    </Card>
  )
}
