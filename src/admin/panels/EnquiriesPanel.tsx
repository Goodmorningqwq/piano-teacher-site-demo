import { useQueryClient } from '@tanstack/react-query'
import { useLang } from '@/i18n/language-context'
import { useEnquiries } from '@/hooks/useContent'
import { deleteEnquiry, saveEnquiry } from '@/lib/backend'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { PanelHeader } from '../components/Panel'
import { DeleteButton } from '../components/RowControls'
import { cn } from '@/lib/cn'
import type { Enquiry } from '@/lib/database.types'

export function EnquiriesPanel() {
  const { t, lang } = useLang()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { data: enquiries, isPending } = useEnquiries()

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['enquiries'] })

  async function setRead(enquiry: Enquiry, isRead: boolean) {
    try {
      await saveEnquiry(enquiry.id, { is_read: isRead })
    } catch {
      showToast({ message: t('saveError'), tone: 'error' })
    }
    void refresh()
  }

  async function remove(enquiry: Enquiry) {
    try {
      await deleteEnquiry(enquiry.id)
    } catch {
      showToast({ message: t('saveError'), tone: 'error' })
      return
    }
    void refresh()
    showToast({ message: t('deleted'), tone: 'info' })
  }

  const formatter = new Intl.DateTimeFormat(lang === 'zh' ? 'zh-HK' : 'en-HK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <>
      <PanelHeader title={t('enquiriesTitle')} intro={t('enquiriesIntro')} />

      {isPending ? (
        <p className="text-muted">{t('loading')}</p>
      ) : enquiries && enquiries.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {enquiries.map((enquiry) => (
            <li
              key={enquiry.id}
              className={cn(
                'rounded-lg border bg-bg-elevated p-5',
                enquiry.is_read ? 'border-border' : 'border-accent-line',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    {enquiry.name}
                    {!enquiry.is_read && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-contrast">
                        {t('enquiryUnread')}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-subtle">
                    {t('enquiryReceived')} · {formatter.format(new Date(enquiry.created_at))}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void setRead(enquiry, !enquiry.is_read)}
                  >
                    {enquiry.is_read ? t('enquiryMarkUnread') : t('enquiryMarkRead')}
                  </Button>
                  <DeleteButton onConfirm={() => void remove(enquiry)} />
                </div>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-muted">{enquiry.message}</p>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                <a
                  href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
                    lang === 'zh' ? '回覆你的鋼琴課程查詢' : 'Re: your piano lesson enquiry',
                  )}`}
                  className="inline-flex min-h-9 items-center rounded-md bg-accent px-3 text-sm font-medium text-accent-contrast hover:bg-accent-hover"
                >
                  {t('enquiryReply')}
                </a>
                <a
                  href={`mailto:${enquiry.email}`}
                  className="inline-flex min-h-9 items-center rounded-md px-3 text-sm text-muted hover:text-accent"
                >
                  {enquiry.email}
                </a>
                {enquiry.phone && (
                  <a
                    href={`tel:${enquiry.phone.replace(/\s/g, '')}`}
                    className="inline-flex min-h-9 items-center rounded-md px-3 text-sm text-muted hover:text-accent"
                  >
                    {enquiry.phone}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-muted">
          {t('enquiriesEmpty')}
        </p>
      )}
    </>
  )
}
