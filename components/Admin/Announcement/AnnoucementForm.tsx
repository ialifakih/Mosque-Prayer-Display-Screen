"use client"

import {
  createAnnouncementAction,
  updateAnnouncementAction,
} from "@/app/admin/actions/announcements"
import { Spinner } from "@/components/ui/spinner"
import type {
  AnnouncementInput,
  AnnouncementRecord,
} from "@/types/AnnouncementType"
import { useState } from "react"

interface AnnouncementFormProps {
  announcement: AnnouncementRecord | null
  today: string
  onComplete: (announcement: AnnouncementRecord) => void
  onPreview: (announcement: AnnouncementInput) => void
}

export function AnnouncementForm({
  announcement,
  today,
  onComplete,
  onPreview,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState(announcement?.title ?? "")
  const [message, setMessage] = useState(announcement?.message ?? "")
  const [startDate, setStartDate] = useState(
    announcement?.start_date ?? today,
  )
  const [endDate, setEndDate] = useState(announcement?.end_date ?? today)
  const [isActive, setIsActive] = useState(announcement?.is_active ?? true)
  const [priority, setPriority] = useState(announcement?.priority ?? 0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const values = (): AnnouncementInput => ({
    title,
    message,
    image_url: announcement?.image_url ?? null,
    start_date: startDate,
    end_date: endDate,
    is_active: isActive,
    priority,
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const saved = announcement
        ? await updateAnnouncementAction(announcement.id, values())
        : await createAnnouncementAction(values())
      onComplete(saved)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Save failed")
    } finally {
      setIsLoading(false)
    }
  }

  const inputClasses =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-mosqueBrand-primary focus:ring-2 focus:ring-mosqueBrand-primary/20"

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
      <div>
        <label htmlFor="announcement-title" className="text-sm font-medium text-slate-800">
          Title
        </label>
        <input
          id="announcement-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClasses}
          maxLength={120}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="announcement-message" className="text-sm font-medium text-slate-800">
          Message
        </label>
        <textarea
          id="announcement-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className={inputClasses}
          rows={5}
          maxLength={600}
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="announcement-start" className="text-sm font-medium text-slate-800">
            Start date
          </label>
          <input
            id="announcement-start"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={inputClasses}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="announcement-end" className="text-sm font-medium text-slate-800">
            End date
          </label>
          <input
            id="announcement-end"
            type="date"
            min={startDate}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className={inputClasses}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
        <div>
          <label htmlFor="announcement-priority" className="text-sm font-medium text-slate-800">
            Priority
          </label>
          <input
            id="announcement-priority"
            type="number"
            min={0}
            max={999}
            step={1}
            value={priority}
            onChange={(event) => setPriority(Number(event.target.value))}
            className={inputClasses}
            required
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-slate-500">Higher numbers show first.</p>
        </div>
        <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            disabled={isLoading}
            className="h-4 w-4 accent-mosqueBrand-primary"
          />
          Active
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => onPreview(values())}
          disabled={isLoading || title.trim() === "" || message.trim() === ""}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Preview
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-w-36 items-center justify-center rounded-lg bg-mosqueBrand-primary px-4 py-2.5 text-sm font-semibold text-mosqueBrand-onPrimary hover:bg-mosqueBrand-primary/90 disabled:opacity-50"
        >
          {isLoading ? <Spinner className="text-current" /> : "Save announcement"}
        </button>
      </div>
    </form>
  )
}
