export const SOCIAL_NETWORK_OPTIONS = [
  { key: "discord", label: "Discord" },
  { key: "email", label: "Email" },
  { key: "facebook", label: "Facebook" },
  { key: "github", label: "GitHub" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "pinterest", label: "Pinterest" },
  { key: "reddit", label: "Reddit" },
  { key: "telegram", label: "Telegram" },
  { key: "threads", label: "Threads" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "x", label: "X/Twitter" },
  { key: "youtube", label: "YouTube" },
  { key: "malt", label: "Malt" },
] as const;

export type SocialNetworkKey = (typeof SOCIAL_NETWORK_OPTIONS)[number]["key"];

export const SOCIAL_NETWORK_LABELS = Object.fromEntries(
  SOCIAL_NETWORK_OPTIONS.map((option) => [option.key, option.label]),
) as Record<SocialNetworkKey, string>;

export const SOCIAL_NETWORK_KEYS = new Set<SocialNetworkKey>(
  SOCIAL_NETWORK_OPTIONS.map((option) => option.key),
);

export const normalizeSocialNetworkKey = (value: string): SocialNetworkKey | null => {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "-");
  if (normalized === "twitter" || normalized === "x-twitter") {
    return "x";
  }
  return SOCIAL_NETWORK_KEYS.has(normalized as SocialNetworkKey)
    ? (normalized as SocialNetworkKey)
    : null;
};

export const getSocialNetworkLabel = (key: SocialNetworkKey): string => SOCIAL_NETWORK_LABELS[key];

export const resolveSocialNetworkLabel = (value: string): string => {
  const key = normalizeSocialNetworkKey(value);
  if (key) {
    return getSocialNetworkLabel(key);
  }

  const trimmed = value.trim();
  if (!trimmed) return value;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};
