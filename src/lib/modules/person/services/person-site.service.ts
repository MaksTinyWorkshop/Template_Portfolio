import { person as staticPerson, social as staticSocial } from "@/web/resources";
import { getPersonView } from "./person-profile.service";
import { buildPersonSiteData, type PersonSiteData } from "../domain/person.utils";

const fallbackSocials = staticSocial.map((entry) => ({
  name: entry.name,
  label: entry.name,
  url: entry.link,
  icon: entry.icon,
  essential: entry.essential,
}));

const fallbackSite: PersonSiteData = {
  name: staticPerson.name,
  avatar: staticPerson.avatar,
  location: staticPerson.location,
  role: staticPerson.role,
  languages: staticPerson.languages,
  email: staticPerson.email,
  socials: fallbackSocials,
};

export async function getSitePersonData(): Promise<PersonSiteData> {
  const view = await getPersonView();
  return buildPersonSiteData(view, fallbackSite);
}
