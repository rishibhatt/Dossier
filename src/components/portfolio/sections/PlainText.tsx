import { Fragment, type ReactNode } from "react"

import type { TextProps } from "./types"

/** Word masks for the hero line reveal. Real text stays in the DOM and reads normally. */
export function splitWords(value: string): ReactNode {
  const words = value.split(/\s+/).filter(Boolean)
  return words.map((w, i) => (
    <Fragment key={i}>
      <span className="pf-mask" data-pf-line="">
        <span>{w}</span>
      </span>
      {i < words.length - 1 ? " " : null}
    </Fragment>
  ))
}

export function paragraphs(value: string): ReactNode {
  return value
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => <p key={i}>{p}</p>)
}

/** Read-only text slot (server, published page, export). */
export function PlainText({ as: Tag = "span", value, className, split, paragraphs: paras, attrs }: TextProps) {
  return (
    <Tag className={className} {...attrs}>
      {split ? splitWords(value) : paras ? paragraphs(value) : value}
    </Tag>
  )
}
