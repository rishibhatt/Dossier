"use client"

import { useState } from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * Pixel-art portrait in a rounded square. Initials sit underneath and show if the image never loads.
 * The size comes from `className` (e.g. `size-14`); the file is requested at 96px, which covers 2x screens up to 48px.
 */
export function BuilderAvatar({ src, initials, className }: { src: string; initials: string; className?: string }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-[1.1rem] bg-[var(--site-accent-wash)] text-sm font-bold text-[var(--site-ink)] ring-1 ring-[var(--site-rule)]",
        className
      )}
    >
      {initials}
      {failed ? null : (
        <Image
          src={src}
          alt=""
          width={96}
          height={96}
          sizes="56px"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn("absolute inset-0 size-full object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
        />
      )}
    </span>
  )
}
