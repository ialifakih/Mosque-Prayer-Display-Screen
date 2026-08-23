import type { AnnouncementInput } from "@/types/AnnouncementType"

export function AnnouncementCard({
  announcement,
}: {
  announcement: Pick<AnnouncementInput, "title" | "message">
}) {
  return (
    <article className="min-w-0 flex-1">
      <h3 className="truncate text-xl font-bold leading-tight xl:text-2xl">
        {announcement.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-lg font-medium leading-snug xl:text-xl">
        {announcement.message}
      </p>
    </article>
  )
}
