import type { PersonSiteData } from "@/lib/modules/person/domain/person.utils";
import { getSitePersonData } from "@/lib/modules/person/services/person-site.service";
import { Mailchimp } from "@/web/components";
import { Posts } from "@/web/components/blog/Posts";
import { Projects } from "@/web/components/work/Projects";
import { about, baseURL, home, routes } from "@/web/resources";
import {
  Avatar,
  Badge,
  Button,
  Column,
  Heading,
  Line,
  Meta,
  RevealFx,
  Row,
  Schema,
  Text,
} from "@once-ui-system/core";

// Force dynamic rendering - disable static generation during build
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default async function Home() {
  const sitePerson: PersonSiteData = await getSitePersonData();
  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: sitePerson.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${sitePerson.avatar}`,
        }}
      />
      <Column fillWidth horizontal="center" gap="m">
        <Column maxWidth="s" horizontal="center" align="center">
          {home.featured.display && (
            <RevealFx
              fillWidth
              horizontal="center"
              paddingTop="16"
              paddingBottom="32"
              paddingLeft="12"
            >
              <Badge
                background="brand-alpha-weak"
                paddingX="12"
                paddingY="4"
                onBackground="neutral-strong"
                textVariant="label-default-s"
                arrow={false}
                href={home.featured.href}
              >
                <Row paddingY="2">{home.featured.title}</Row>
              </Badge>
            </RevealFx>
          )}
          <RevealFx
            translateY="4"
            fillWidth
            horizontal="center"
            paddingBottom="16"
          >
            <Heading wrap="balance" variant="display-strong-l">
              {home.headline}
            </Heading>
          </RevealFx>
          <RevealFx
            translateY="8"
            fillWidth
            horizontal="center"
            paddingBottom="32"
          >
            <Text
              wrap="balance"
              onBackground="neutral-weak"
              variant="heading-default-xl"
            >
              {home.subline}
            </Text>
          </RevealFx>
          <RevealFx
            paddingTop="12"
            delay={0.4}
            horizontal="center"
            paddingLeft="12"
          >
            <Button
              id="about"
              data-border="rounded"
              href={about.path}
              variant="secondary"
              size="m"
              weight="default"
              arrowIcon
            >
              <Row gap="8" vertical="center" paddingRight="4">
                {about.avatar.display && (
                  <Avatar
                    marginRight="8"
                    style={{ marginLeft: "-0.75rem" }}
                    src={sitePerson.avatar}
                    size="m"
                  />
                )}
                {about.title}
              </Row>
            </Button>
          </RevealFx>
        </Column>
      </Column>
      <Column fillWidth gap="24" marginBottom="l">
        <RevealFx translateY="16" delay={0.6}>
          <Row fillWidth horizontal="center">
            <Line maxWidth={120} style={{ height: 4 }} />
          </Row>
        </RevealFx>
        <RevealFx translateY="16" delay={0.7}>
          <Row fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
            <Row flex={1} paddingLeft="l" paddingTop="24">
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                Dernier projet
              </Heading>
            </Row>
            <Row flex={3}>
              <Projects range={[1, 1]} />
            </Row>
          </Row>
        </RevealFx>
        <Row fillWidth horizontal="center">
          <Line maxWidth={120} style={{ height: 4 }} />
        </Row>
      </Column>
      {routes["/blog"] && (
        <Column fillWidth gap="24" marginBottom="l">
          <Row fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
            <Row flex={1} paddingLeft="l" paddingTop="24">
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                Derniers articles publiés
              </Heading>
            </Row>
            <Row flex={3} paddingX="20">
              <Posts range={[1, 2]} columns="2" sitePerson={sitePerson} />
            </Row>
          </Row>
        </Column>
      )}
      <Column fillWidth gap="24" marginBottom="l">
        <Row fillWidth horizontal="center">
          <Line maxWidth={120} style={{ height: 4 }} />
        </Row>
        <Row fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
          <Row flex={1} paddingLeft="l" paddingTop="24">
            <Heading as="h2" variant="display-strong-xs" wrap="balance">
              Autres projets
            </Heading>
          </Row>
          <Row flex={3}>
            <Projects range={[2]} />
          </Row>
        </Row>
        <Row fillWidth horizontal="center">
          <Line maxWidth={120} style={{ height: 4 }} />
        </Row>
      </Column>
      <Mailchimp />
    </Column>
  );
}
