import { BuilderAvatar } from "@/components/marketing/BuilderAvatar"
import { AUTHOR } from "@/content/blog/posts"
import { cn } from "@/lib/utils"

export function Byline({ meta, className }: { meta?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BuilderAvatar src={AUTHOR.avatar} initials={AUTHOR.initials} className="size-11" />
      <p className="text-sm leading-snug">
        <span className="block font-semibold">
          <a href={AUTHOR.url} rel="author noopener" target="_blank" className="hover:underline">
            {AUTHOR.name}
          </a>
        </span>
        <span className="block text-[var(--site-ink-2)]">{meta ?? AUTHOR.role}</span>
      </p>
    </div>
  )
}
