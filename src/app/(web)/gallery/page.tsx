import { Flex, Meta, Schema } from "@once-ui-system/core";
import GalleryView from "@/web/components/gallery/GalleryView";
import { baseURL, gallery } from "@/web/resources";
import { getSitePersonData } from "@/lib/modules/person/services/person-site.service";
import type { PersonSiteData } from "@/lib/modules/person/domain/person.utils";

// Force dynamic rendering - disable static generation during build
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return Meta.generate({
    title: gallery.title,
    description: gallery.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(gallery.title)}`,
    path: gallery.path,
  });
}

export default async function Gallery() {
  const sitePerson: PersonSiteData = await getSitePersonData();
  return (
    <Flex maxWidth="l">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={gallery.title}
        description={gallery.description}
        path={gallery.path}
        image={`/api/og/generate?title=${encodeURIComponent(gallery.title)}`}
        author={{
          name: sitePerson.name,
          url: `${baseURL}${gallery.path}`,
          image: `${baseURL}${sitePerson.avatar}`,
        }}
      />
      <GalleryView />
    </Flex>
  );
}
