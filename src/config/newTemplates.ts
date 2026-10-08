/**
 * Templates to announce on the dashboard ("a new look is available"). Add an entry when a template ships,
 * remove it after a month or so. Ids must exist in `src/lib/design/templates/specs.ts`.
 * People who dismiss the card, or open the studio from it, never see those ids again (stored on their device).
 */
export const NEW_TEMPLATE_IDS: readonly { id: string; name: string }[] = [
  { id: "boardroom", name: "Boardroom" },
  { id: "scholar", name: "Scholar" },
]
