/**
 * The social profile register: one row per surface, with the bio as published.
 * Copy is verbatim from the SocialKit prototype.
 */

export type ProfileTier = "Tier 1" | "Tier 2" | "Tier 3" | "Deprioritised";

export interface SocialProfile {
  /** Platform name — also the row key. */
  platform: string;
  handle: string;
  tier: ProfileTier;
  role: string;
  bio: string;
  link: string;
}

export const PROFILES: SocialProfile[] = [
  {
    platform: "X",
    handle: "@okweknowledge",
    tier: "Tier 1",
    role: "Ideas, frameworks, short analysis, questions",
    bio: "How trade, logistics and enterprise actually work. Frameworks and field measurements from real shipments. Sources on every claim.",
    link: "okweknowledge.com/brief",
  },
  {
    platform: "LinkedIn",
    handle: "/company/okwe-knowledge",
    tier: "Tier 1",
    role: "Professional analysis, document posts, case files",
    bio: "The intelligence and capability platform of the Okwe ecosystem. We research how businesses source, move and price goods — then teach it.",
    link: "okweknowledge.com",
  },
  {
    platform: "YouTube",
    handle: "@okweknowledge",
    tier: "Tier 1",
    role: "Deep explainers, case studies, recorded workshops",
    bio: "Long-form explanations of trade, logistics and enterprise. One subject, properly explained, sources listed in the description.",
    link: "okweknowledge.com/library",
  },
  {
    platform: "Instagram",
    handle: "@okweknowledge",
    tier: "Tier 2",
    role: "Carousels, definitions, statistics",
    bio: "Practical knowledge about trade and logistics. Carousels you can actually use.",
    link: "okweknowledge.com/brief",
  },
  {
    platform: "TikTok",
    handle: "@okweknowledge",
    tier: "Tier 2",
    role: "One-concept explainers, myths, demonstrations",
    bio: "One idea about how the real economy works, explained in under 90 seconds.",
    link: "okweknowledge.com",
  },
  {
    platform: "Facebook / Threads",
    handle: "@okweknowledge",
    tier: "Tier 3",
    role: "Repurposed distribution, events",
    bio: "Practical business, trade and logistics education from Okwe Knowledge.",
    link: "okweknowledge.com",
  },
  {
    platform: "Twitch",
    handle: "—",
    tier: "Deprioritised",
    role: "Revisit only when live research sessions become routine",
    bio: "Not launched. Live formats need an audience that already shows up.",
    link: "—",
  },
];

export const TIER_FILTERS: Array<"All" | ProfileTier> = [
  "All",
  "Tier 1",
  "Tier 2",
  "Tier 3",
  "Deprioritised",
];
