import { Block, has, Meta } from "../primitives"
import type { SectionModule, VariantProps } from "../types"

/** list: ruled rows with the part under the title. table: year, production, part, company in columns (long CVs). */
function CreditsList({ section, ctx }: VariantProps<"credits">) {
  const { T } = ctx
  return (
    <Block type="credits" className="pf-credits">
      <ul className="pf-list" data-pf-items="">
        {section.data.items.map((c, i) => {
          const at = (field: string) => ({ sectionId: section.id, field, index: i })
          return (
            <li key={i} className="pf-item" data-pf-item="">
              <div className="pf-item__head">
                <T as="h3" className="pf-item__title" path={at("title")} value={c.title} />
                <Meta ctx={ctx} parts={[[at("year"), c.year]]} />
              </div>
              {has(c.role) || ctx.editing ? <T as="p" className="pf-item__sub" path={at("role")} value={c.role} /> : null}
              {has(c.company) || ctx.editing ? <T as="p" className="pf-meta" path={at("company")} value={c.company} /> : null}
            </li>
          )
        })}
      </ul>
    </Block>
  )
}

function CreditsTable({ section, ctx }: VariantProps<"credits">) {
  const { T } = ctx
  return (
    <Block type="credits" className="pf-credits pf-credits--table">
      <div className="pf-table-wrap" tabIndex={0} role="region" aria-label="Credits">
        <table className="pf-table">
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Production</th>
              <th scope="col">Part</th>
              <th scope="col">Company</th>
            </tr>
          </thead>
          <tbody data-pf-items="">
            {section.data.items.map((c, i) => {
              const at = (field: string) => ({ sectionId: section.id, field, index: i })
              return (
                <tr key={i} data-pf-item="">
                  <td className="pf-meta"><T path={at("year")} value={c.year} /></td>
                  <th scope="row"><T path={at("title")} value={c.title} /></th>
                  <td><T path={at("role")} value={c.role} /></td>
                  <td className="pf-meta"><T path={at("company")} value={c.company} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Block>
  )
}

export const creditsModule: SectionModule<"credits"> = {
  variants: { list: CreditsList, table: CreditsTable },
  fallback: "list",
  isEmpty: (s) => !s.data.items.some((c) => has(c.title)),
}
