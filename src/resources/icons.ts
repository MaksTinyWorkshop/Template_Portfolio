import { IconType } from "react-icons";

import {
  HiArrowRight,
  HiArrowTopRightOnSquare,
  HiArrowUpRight,
  HiCalendarDays,
  HiEnvelope,
  HiOutlineDocument,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineGlobeAsiaAustralia,
  HiOutlineLink,
  HiOutlineRocketLaunch,
} from "react-icons/hi2";

import {
  PiBookBookmarkDuotone,
  PiGridFourDuotone,
  PiHouseDuotone,
  PiImageDuotone,
  PiUserCircleDuotone,
} from "react-icons/pi";

import {
  SiAstro,
  SiDocker,
  SiFigma,
  SiGithubactions,
  SiGitlab,
  SiJavascript,
  SiMalt,
  SiMysql,
  SiNestjs,
  SiNextdotjs,
  SiPostgresql,
  SiPrisma,
  SiSpring,
  SiSupabase,
  SiTypescript,
  SiVuedotjs,
} from "react-icons/si";

import {
  FaDiscord,
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaJava,
  FaLinkedin,
  FaPinterest,
  FaReddit,
  FaTelegram,
  FaThreads,
  FaWhatsapp,
  FaX,
  FaXTwitter,
} from "react-icons/fa6";

import { FaSignOutAlt } from "react-icons/fa";
import { GrUserAdmin } from "react-icons/gr";

export const iconLibrary: Record<string, IconType> = {
  arrowUpRight: HiArrowUpRight,
  arrowRight: HiArrowRight,
  email: HiEnvelope,
  globe: HiOutlineGlobeAsiaAustralia,
  person: PiUserCircleDuotone,
  grid: PiGridFourDuotone,
  book: PiBookBookmarkDuotone,
  openLink: HiOutlineLink,
  calendar: HiCalendarDays,
  home: PiHouseDuotone,
  gallery: PiImageDuotone,
  discord: FaDiscord,
  eye: HiOutlineEye,
  eyeOff: HiOutlineEyeSlash,
  github: FaGithub,
  linkedin: FaLinkedin,
  x: FaX,
  twitter: FaXTwitter,
  threads: FaThreads,
  arrowUpRightFromSquare: HiArrowTopRightOnSquare,
  document: HiOutlineDocument,
  rocket: HiOutlineRocketLaunch,
  javascript: SiJavascript,
  nextjs: SiNextdotjs,
  supabase: SiSupabase,
  figma: SiFigma,
  astro: SiAstro,
  vue: SiVuedotjs,
  typescript: SiTypescript,
  spring: SiSpring,
  nest: SiNestjs,
  postgresql: SiPostgresql,
  mysql: SiMysql,
  prisma: SiPrisma,
  docker: SiDocker,
  githubactions: SiGithubactions,
  gitlab: SiGitlab,
  facebook: FaFacebook,
  pinterest: FaPinterest,
  whatsapp: FaWhatsapp,
  reddit: FaReddit,
  telegram: FaTelegram,
  instagram: FaInstagram,
  java: FaJava,
  malt: SiMalt,
  adminDashboard: GrUserAdmin,
  signOut: FaSignOutAlt,
};

export type IconLibrary = typeof iconLibrary;
export type IconName = keyof IconLibrary;
