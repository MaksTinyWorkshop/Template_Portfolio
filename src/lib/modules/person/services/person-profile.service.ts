import { findSiteOwner, listPersons } from "../infrastructure/person.repo";
import { buildPersonView } from "../domain/person.utils";
import type { PersonView } from "../domain/person.utils";

export async function getPersonView(): Promise<PersonView | null> {
  const siteOwner = await findSiteOwner();
  if (siteOwner) {
    return buildPersonView(siteOwner);
  }

  const persons = await listPersons();
  if (!persons.length) {
    return null;
  }

  return buildPersonView(persons[0]);
}
