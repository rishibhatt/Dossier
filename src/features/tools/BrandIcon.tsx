import type { IconDefinition } from "@fortawesome/free-brands-svg-icons"
import {
  faBehance,
  faBluesky,
  faCodepen,
  faDiscord,
  faDribbble,
  faFacebookF,
  faFigma,
  faGithub,
  faGitlab,
  faInstagram,
  faKaggle,
  faLinkedinIn,
  faMedium,
  faPinterestP,
  faProductHunt,
  faReddit,
  faSnapchat,
  faSoundcloud,
  faSpotify,
  faStackOverflow,
  faSubstack,
  faTelegram,
  faThreads,
  faTiktok,
  faTwitch,
  faWhatsapp,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons"
import { Mail } from "lucide-react"

/** The companies' own marks (Font Awesome Brands, CC BY 4.0), keyed like PLATFORMS in linkPage.ts. */
const BRANDS: Record<string, IconDefinition> = {
  linkedin: faLinkedinIn,
  github: faGithub,
  gitlab: faGitlab,
  x: faXTwitter,
  instagram: faInstagram,
  threads: faThreads,
  bluesky: faBluesky,
  tiktok: faTiktok,
  youtube: faYoutube,
  facebook: faFacebookF,
  behance: faBehance,
  dribbble: faDribbble,
  figma: faFigma,
  medium: faMedium,
  substack: faSubstack,
  spotify: faSpotify,
  soundcloud: faSoundcloud,
  twitch: faTwitch,
  discord: faDiscord,
  whatsapp: faWhatsapp,
  telegram: faTelegram,
  pinterest: faPinterestP,
  reddit: faReddit,
  snapchat: faSnapchat,
  codepen: faCodepen,
  stackoverflow: faStackOverflow,
  kaggle: faKaggle,
  producthunt: faProductHunt,
}

export function BrandIcon({ name, className }: { name: string; className?: string }) {
  if (name === "email") return <Mail className={className} aria-hidden />
  const def = BRANDS[name]
  if (!def) return null
  const [w, h, , , path] = def.icon
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} fill="currentColor" aria-hidden focusable="false">
      {(Array.isArray(path) ? path : [path]).map((d) => (
        <path key={d.slice(0, 24)} d={d} />
      ))}
    </svg>
  )
}
