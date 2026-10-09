/** Credit economy. Client-safe: no secrets, just the numbers the UI and the server agree on. */

/** 1 credit buys this many extra design shuffles a day, on top of the plan's daily cap. */
export const SHUFFLE_PACK_BONUS = 20
/** How long a shuffle pack keeps adding its bonus. */
export const SHUFFLE_PACK_DAYS = 7
export const SHUFFLE_PACK_COST = 1
/** Credits that unlock Starter permanently. */
export const STARTER_UNLOCK_COST = 3

export type CreditItem = "shuffle_pack" | "starter_unlock"

export const CREDIT_COST: Record<CreditItem, number> = {
  shuffle_pack: SHUFFLE_PACK_COST,
  starter_unlock: STARTER_UNLOCK_COST,
}

/** Referral rules, shared by the capture route, the attribution helper and the docs. */
export const REFERRAL_COOKIE = "dx_ref"
export const REFERRAL_WINDOW_DAYS = 30
export const REFERRAL_CODE_PATTERN = /^[a-z2-9]{8}$/

/** Plain-language labels for rejected referrals. Shown to the referrer, so they never reveal who the person is. */
export const REJECT_REASON_LABEL: Record<string, string> = {
  self_referral: "Your own account",
  same_email: "Same email as yours",
  existing_account: "Already had an account",
  expired: "Signed up after the link expired",
  disposable_email: "Temporary email address",
  same_network: "Signed up from your network",
  referrer_monthly_limit: "Over the 20 a month limit",
}
