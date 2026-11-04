import type { PortfolioSection } from "@/types/dossier"

/** Dev only (/dev/studio?work): one of every profession section, filled, to check layouts. Sample pictures and video are public test media. */
const pic = (id: number) => `https://picsum.photos/id/${id}/1200/900`

export const WORK_SECTIONS: PortfolioSection[] = [
  {
    id: "dev-gallery",
    type: "gallery",
    data: {
      items: [
        { imageUrl: pic(1048), caption: "Courtyard house, Alibaug, 2024", link: null },
        { imageUrl: pic(1031), caption: "Facade study, Pune", link: null },
        { imageUrl: pic(1076), caption: "Library reading room", link: null, beforeUrl: pic(1067) },
        { imageUrl: pic(1040), caption: "Stair core, timber and steel", link: null },
        { imageUrl: pic(1029), caption: "Night view", link: null },
        { imageUrl: pic(1016), caption: "Site, before work began", link: null },
      ],
    },
  },
  { id: "dev-showreel", type: "showreel", data: { items: [{ videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", title: "Showreel 2025", note: "Two minutes, recent screen work" }, { videoUrl: "https://vimeo.com/76979871", title: "Stage excerpt", note: "Live, 2024" }] } },
  {
    id: "dev-credits",
    type: "credits",
    data: { items: [{ title: "The Long Monsoon", role: "Meera (lead)", company: "dir. A. Rao, Prithvi Theatre", year: "2025" }, { title: "Glass Rooms", role: "Supporting", company: "Netflix India", year: "2024" }, { title: "Salt", role: "Ensemble", company: "NCPA Mumbai", year: "2022" }] },
  },
  {
    id: "dev-services",
    type: "services",
    data: { items: [{ name: "Full home design", description: "Concept to handover for apartments and villas.", price: "From ₹4,50,000" }, { name: "Single room refresh", description: "One room, two design rounds, sourcing list.", price: "From ₹60,000" }, { name: "Consultation", description: "Two hours on site with a written follow-up.", price: "₹8,000" }] },
  },
  {
    id: "dev-testimonials",
    type: "testimonials",
    data: { items: [{ quote: "She listened more than she talked, and the flat finally feels like ours.", name: "Ananya Shah", role: "Homeowner, Bandra" }, { quote: "On time, on budget, and the site team respected her.", name: "Rohan Mehta", role: "Contractor" }] },
  },
  { id: "dev-press", type: "press", data: { items: [{ title: "Ten homes that use light well", outlet: "Architectural Digest India", year: "2025", link: "https://example.com" }, { title: "Rising designers to watch", outlet: "Elle Decor", year: "2024", link: null }] } },
  { id: "dev-publications", type: "publications", data: { items: [{ title: "Daylight and wellbeing in dense housing", outlet: "Journal of Indian Architecture", year: "2023", link: "https://example.com" }] } },
  {
    id: "dev-practice",
    type: "practice",
    data: { name: "Studio Lindqvist", address: "3rd floor, 14 Hill Road\nBandra West, Mumbai 400050", hours: ["Mon to Fri, 10:00 to 18:00", "Sat by appointment"], bookingUrl: "https://example.com/book", mapUrl: "https://maps.google.com" },
  },
]
