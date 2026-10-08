import type { DesignTemplate } from "@/lib/design/templates"
import { cn } from "@/lib/utils"

/**
 * A miniature of a template: its real palette and overall page layout, drawn from plain boxes.
 * It is a schematic, not a screenshot, so it stays crisp and costs nothing to render.
 */
export function TemplateThumb({ template, className }: { template: DesignTemplate; className?: string }) {
  const { bg, surface, text, accent } = template.swatch
  const bar = (w: string, h: string, o = 1, color = text) => (
    <span className="block rounded-full" style={{ width: w, height: h, background: color, opacity: o }} />
  )
  const rule = `${text}33`

  return (
    <div className={cn("relative aspect-[4/3] w-full overflow-hidden", className)} style={{ background: bg }} aria-hidden>
      {template.layout === "split-fixed" ? (
        <div className="grid h-full grid-cols-[34%_1fr]">
          <div className="flex flex-col gap-[0.35rem] p-[9%]" style={{ background: surface }}>
            {bar("78%", "0.55rem")}
            {bar("52%", "0.28rem", 0.5)}
            <span className="mt-auto block h-[0.8rem] w-[70%] rounded-sm" style={{ background: accent }} />
          </div>
          <div className="flex flex-col justify-center gap-[0.45rem] p-[8%]">
            {bar("90%", "0.3rem", 0.55)}
            {bar("70%", "0.3rem", 0.4)}
            <span className="mt-[0.4rem] block border-t" style={{ borderColor: rule }} />
            {bar("84%", "0.3rem", 0.4)}
            {bar("60%", "0.3rem", 0.4)}
          </div>
        </div>
      ) : null}

      {template.layout === "single-column" ? (
        <div className="flex h-full flex-col items-center justify-center gap-[0.4rem] p-[8%] text-center">
          {bar("52%", "0.85rem")}
          {bar("32%", "0.3rem", 0.5)}
          <span className="my-[0.2rem] block h-[0.65rem] w-[22%] rounded-sm" style={{ background: accent }} />
          <span className="block w-[78%] border-t" style={{ borderColor: rule }} />
          {bar("78%", "0.28rem", 0.4)}
          {bar("62%", "0.28rem", 0.4)}
        </div>
      ) : null}

      {template.layout === "asymmetric" ? (
        <div className="relative h-full p-[8%]">
          <span className="block">{bar("62%", "1.1rem")}</span>
          <span className="mt-[0.3rem] block">{bar("38%", "1.1rem")}</span>
          <span className="absolute bottom-[10%] left-[8%] flex w-[42%] flex-col gap-[0.3rem]">
            {bar("100%", "0.28rem", 0.45)}
            {bar("78%", "0.28rem", 0.45)}
          </span>
          <span className="absolute right-[8%] top-[34%] block h-[44%] w-[34%] rounded-md" style={{ background: surface, border: `1px solid ${rule}` }}>
            <span className="m-[18%] block h-[0.7rem] w-[44%] rounded-sm" style={{ background: accent }} />
          </span>
        </div>
      ) : null}

      {template.layout === "magazine" ? (
        <div className="flex h-full flex-col justify-between p-[8%]">
          <span className="flex flex-col gap-[0.25rem]">
            {bar("34%", "0.22rem", 0.5)}
            {bar("94%", "0.95rem")}
            {bar("58%", "0.95rem")}
          </span>
          <span className="grid grid-cols-3 gap-[5%] border-t pt-[5%]" style={{ borderColor: rule }}>
            {[0, 1, 2].map((i) => (
              <span key={i} className="flex flex-col gap-[0.25rem]">
                <span className="block h-[0.7rem] w-full rounded-sm" style={{ background: i === 0 ? accent : surface }} />
                {bar("100%", "0.24rem", 0.4)}
                {bar("72%", "0.24rem", 0.4)}
              </span>
            ))}
          </span>
        </div>
      ) : null}

      {template.layout === "bento" ? (
        <div className="grid h-full grid-cols-3 grid-rows-3 gap-[0.3rem] p-[6%]">
          <span className="col-span-2 row-span-2 flex flex-col justify-end gap-[0.3rem] rounded-md p-[10%]" style={{ background: surface, border: `1px solid ${rule}` }}>
            {bar("68%", "0.8rem")}
            {bar("42%", "0.26rem", 0.5)}
          </span>
          <span className="rounded-md" style={{ background: accent }} />
          <span className="rounded-md" style={{ background: surface, border: `1px solid ${rule}` }} />
          <span className="col-span-2 rounded-md" style={{ background: surface, border: `1px solid ${rule}` }} />
          <span className="col-span-3 rounded-md" style={{ background: surface, border: `1px solid ${rule}` }} />
        </div>
      ) : null}
    </div>
  )
}
