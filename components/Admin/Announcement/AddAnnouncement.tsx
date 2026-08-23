"use client"

import {
  deleteAnnouncementAction,
  setAnnouncementActiveAction,
} from "@/app/admin/actions/announcements"
import { AnnouncementCard } from "@/components/Announcement/AnnouncementCard"
import { AnnouncementForm } from "@/components/Admin/Announcement/AnnoucementForm"
import { Modal } from "@/components/ui/Modal"
import type {
  AnnouncementInput,
  AnnouncementRecord,
} from "@/types/AnnouncementType"
import { useState } from "react"

function getStatus(announcement: AnnouncementRecord, today: string): string {
  if (!announcement.is_active) return "Inactive"
  if (announcement.start_date > today) return "Upcoming"
  if (announcement.end_date < today) return "Expired"
  return "Showing"
}

function statusClasses(status: string): string {
  if (status === "Showing") return "bg-emerald-100 text-emerald-800"
  if (status === "Upcoming") return "bg-amber-100 text-amber-800"
  return "bg-slate-100 text-slate-700"
}

export default function AddAnnouncement({
  initialAnnouncements,
  today,
}: {
  initialAnnouncements: AnnouncementRecord[]
  today: string
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [editing, setEditing] = useState<AnnouncementRecord | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [preview, setPreview] = useState<AnnouncementInput | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const openCreate = () => {
    setEditing(null)
    setIsFormOpen(true)
  }

  const openEdit = (announcement: AnnouncementRecord) => {
    setEditing(announcement)
    setIsFormOpen(true)
  }

  const replaceAnnouncement = (saved: AnnouncementRecord) => {
    setAnnouncements((current) => {
      const exists = current.some(({ id }) => id === saved.id)
      return exists
        ? current.map((item) => (item.id === saved.id ? saved : item))
        : [...current, saved]
    })
  }

  const finishSave = (saved: AnnouncementRecord) => {
    replaceAnnouncement(saved)
    setIsFormOpen(false)
    setEditing(null)
  }

  const setActive = async (
    announcement: AnnouncementRecord,
    isActive: boolean,
  ) => {
    setBusyId(announcement.id)
    setError(null)
    try {
      replaceAnnouncement(
        await setAnnouncementActiveAction(announcement.id, isActive),
      )
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Update failed")
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (announcement: AnnouncementRecord) => {
    if (!window.confirm(`Delete “${announcement.title}”?`)) return

    setBusyId(announcement.id)
    setError(null)
    try {
      await deleteAnnouncementAction(announcement.id)
      setAnnouncements((current) =>
        current.filter(({ id }) => id !== announcement.id),
      )
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Delete failed")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="w-full max-w-6xl rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Announcements</h2>
          <p className="mt-1 text-sm text-slate-600">
            Schedule notices for the public prayer display.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-mosqueBrand-primary px-4 py-2.5 text-sm font-semibold text-mosqueBrand-onPrimary hover:bg-mosqueBrand-primary/90"
        >
          New announcement
        </button>
      </div>

      {error && (
        <p className="mx-5 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {announcements.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-600">
          No announcements yet. Create one when there is a message for the
          congregation.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Announcement</th>
                <th className="px-5 py-3 font-semibold">Schedule</th>
                <th className="px-5 py-3 font-semibold">Priority</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {announcements.map((announcement) => {
                const status = getStatus(announcement, today)
                const isBusy = busyId === announcement.id
                return (
                  <tr key={announcement.id} className="align-top">
                    <td className="max-w-sm px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {announcement.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-slate-600">
                        {announcement.message}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                      {announcement.start_date}
                      <span className="mx-2 text-slate-400">–</span>
                      {announcement.end_date}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {announcement.priority}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(status)}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setPreview(announcement)}
                          className="font-medium text-slate-700 hover:text-slate-950"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(announcement)}
                          className="font-medium text-mosqueBrand-primary hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            setActive(announcement, !announcement.is_active)
                          }
                          className="font-medium text-slate-700 hover:text-slate-950 disabled:opacity-50"
                        >
                          {announcement.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => remove(announcement)}
                          className="font-medium text-red-700 hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? "Edit announcement" : "New announcement"}
        size="lg"
      >
        <AnnouncementForm
          key={editing?.id ?? `new-${today}`}
          announcement={editing}
          today={today}
          onComplete={finishSave}
          onPreview={setPreview}
        />
      </Modal>

      <Modal
        isOpen={preview != null}
        onClose={() => setPreview(null)}
        title="Public display preview"
        size="lg"
      >
        {preview && (
          <div className="m-4 rounded-xl border border-[#c6a54a] bg-[#fffdf7] p-6 text-mosqueBrand">
            <AnnouncementCard announcement={preview} />
          </div>
        )}
      </Modal>
    </section>
  )
}
