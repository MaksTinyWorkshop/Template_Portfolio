import type {
  DataStyleConfig,
  DisplayConfig,
  EffectsConfig,
  FontsConfig,
  MailchimpConfig,
  ProtectedRoutesConfig,
  RoutesConfig,
  SameAsConfig,
  SchemaConfig,
  SocialSharingConfig,
  StyleConfig,
} from "@/web/types";

import localFont from "next/font/local";
import { social } from "./content";

// IMPORTANT: Replace with your own domain address - it's used for SEO in meta tags and schema
const baseURL: string = "https://your-domain.com";

const routes: RoutesConfig = {
  "/": true,
  "/about": true,
  "/work": true,
  "/blog": true,
  "/admin": true,
  "/legal": true,
  "/gallery": false,
};

const display: DisplayConfig = {
  location: true,
  time: true,
  themeSwitcher: true,
};

// Enable password protection on selected routes
// Set password in the .env file, refer to .env.example
const protectedRoutes: ProtectedRoutesConfig = {
  "/work/automate-design-handovers-with-a-figma-to-code-pipeline": true,
  "/admin": true,
};

const heading = localFont({
  variable: "--font-heading",
  src: [
    {
      path: "../../../../public/fonts/Geist.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
});

const body = localFont({
  variable: "--font-body",
  src: [
    {
      path: "../../../../public/fonts/Geist.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
});

const label = localFont({
  variable: "--font-label",
  src: [
    {
      path: "../../../../public/fonts/Geist.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
});

const code = localFont({
  variable: "--font-code",
  src: [
    {
      path: "../../../../public/fonts/Geist_mono.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
});

const fonts: FontsConfig = {
  heading: heading,
  body: body,
  label: label,
  code: code,
};

// default customization applied to the HTML in the main layout.tsx
const style: StyleConfig = {
  theme: "system", // dark | light | system
  neutral: "gray", // sand | gray | slate | custom
  brand: "cyan", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan | custom
  accent: "red", // blue | indigo | violet | magenta | pink | red | orange | yellow | moss | green | emerald | aqua | cyan | custom
  solid: "contrast", // color | contrast
  solidStyle: "flat", // flat | plastic
  border: "playful", // rounded | playful | conservative
  surface: "translucent", // filled | translucent
  transition: "all", // all | micro | macro
  scaling: "100", // 90 | 95 | 100 | 105 | 110
};

const dataStyle: DataStyleConfig = {
  variant: "gradient", // flat | gradient | outline
  mode: "categorical", // categorical | divergent | sequential
  height: 24, // default chart height
  axis: {
    stroke: "var(--neutral-alpha-weak)",
  },
  tick: {
    fill: "var(--neutral-on-background-weak)",
    fontSize: 11,
    line: false,
  },
};

const effects: EffectsConfig = {
  mask: {
    cursor: false,
    x: 50,
    y: 0,
    radius: 100,
  },
  gradient: {
    display: false,
    opacity: 100,
    x: 50,
    y: 60,
    width: 100,
    height: 50,
    tilt: 0,
    colorStart: "accent-background-strong",
    colorEnd: "page-background",
  },
  dots: {
    display: true,
    opacity: 40,
    size: "2",
    color: "brand-background-strong",
  },
  grid: {
    display: false,
    opacity: 100,
    color: "neutral-alpha-medium",
    width: "0.25rem",
    height: "0.25rem",
  },
  lines: {
    display: false,
    opacity: 100,
    color: "neutral-alpha-weak",
    size: "16",
    thickness: 1,
    angle: 45,
  },
};

const mailchimp: MailchimpConfig = {
  action: "https://url/subscribe/post?parameters",
  effects: {
    mask: {
      cursor: true,
      x: 50,
      y: 0,
      radius: 100,
    },
    gradient: {
      display: true,
      opacity: 90,
      x: 50,
      y: 0,
      width: 50,
      height: 50,
      tilt: 0,
      colorStart: "accent-background-strong",
      colorEnd: "static-transparent",
    },
    dots: {
      display: true,
      opacity: 20,
      size: "2",
      color: "brand-on-background-weak",
    },
    grid: {
      display: false,
      opacity: 100,
      color: "neutral-alpha-medium",
      width: "0.25rem",
      height: "0.25rem",
    },
    lines: {
      display: false,
      opacity: 100,
      color: "neutral-alpha-medium",
      size: "16",
      thickness: 1,
      angle: 90,
    },
  },
};

// default schema data
const buildSameAsMap = () => {
  return social.reduce<SameAsConfig>(
    (current, entry) => {
      if (!entry.link) return current;
      const key = entry.name.toLowerCase().replace(/\s+/g, "");
      current[key] = entry.link;
      return current;
    },
    { site: baseURL },
  );
};

const schema: SchemaConfig = {
  logo: "/images/avatars/avatar_max.jpg",
  type: "Person",
  name: "Maxime F (Max) - Développeur Full Stack",
  description:
    "Développeur Full Stack freelance spécialisé en solutions métier sur mesure. Java/Spring, Next.js, Astro. Basé à Rennes.",
  email: "your.email@example.com",
};

// social links
const sameAs: SameAsConfig = buildSameAsMap();

// social sharing configuration for blog posts
const socialSharing: SocialSharingConfig = {
  display: true,
  platforms: {
    x: false,
    linkedin: true,
    facebook: false,
    pinterest: false,
    whatsapp: true,
    reddit: false,
    telegram: false,
    email: true,
    copyLink: true,
  },
};

export {
  baseURL,
  dataStyle,
  display,
  effects,
  fonts,
  mailchimp,
  protectedRoutes,
  routes,
  sameAs,
  schema,
  socialSharing,
  style,
};
