import type { PersonSiteData } from "@/lib/modules/person/domain/person.utils";
import { getSitePersonData } from "@/lib/modules/person/services/person-site.service";
import type { ProjectSummary } from "@/lib/modules/projects";
import { getProjectBySlug } from "@/lib/modules/projects";
import { formatProjectDate } from "@/lib/utils/formatDate";
import { CustomMDX, ProjectTag, ScrollToHash } from "@/web/components";
import { Projects } from "@/web/components/work/Projects";
import { about, baseURL, work } from "@/web/resources";
import {
  Avatar,
  AvatarGroup,
  Column,
  Heading,
  Icon,
  Line,
  Media,
  Meta,
  Row,
  Schema,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Force dynamic rendering - disable static generation during build
// This prevents DB connection attempts during Docker build
export const dynamic = 'force-dynamic';

const normalizeSlug = (slugParam?: string | string[]) =>
  Array.isArray(slugParam) ? slugParam.join("/") : (slugParam ?? "");

const resolveProjectImage = (project: ProjectSummary) =>
  project.heroImage ?? project.images[0];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slug = normalizeSlug(routeParams.slug).trim();

  if (!slug) {
    return {};
  }

  try {
    const project = await getProjectBySlug(slug);
    const image =
      resolveProjectImage(project) ||
      `/api/og/generate?title=${encodeURIComponent(project.title)}`;

    return Meta.generate({
      title: project.title,
      description: project.summary ?? work.description,
      baseURL,
      image,
      path: `${work.path}/${project.slug}`,
    });
  } catch {
    return {};
  }
}

export default async function Project({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const sitePerson: PersonSiteData = await getSitePersonData();
  const ownerLinkedIn = sitePerson.socials.find(
    (entry) => entry.name.toLowerCase() === "linkedin",
  )?.url;
  const routeParams = await params;
  const slug = normalizeSlug(routeParams.slug).trim();

  if (!slug) {
    notFound();
  }

  let project: ProjectSummary;
  try {
    project = await getProjectBySlug(slug);
  } catch {
    notFound();
  }

  const featuredImage = resolveProjectImage(project);
  const avatars = project.team
    .filter((member) => Boolean(member.avatar))
    .map((member) => ({ src: member.avatar! }));
  const hasMultipleTeamMembers = project.team.length > 1;

  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="l">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        path={`${work.path}/${project.slug}`}
        title={project.title}
        description={project.summary ?? work.description}
        datePublished={project.publishedAt ?? undefined}
        dateModified={project.publishedAt ?? undefined}
        image={
          featuredImage ||
          `/api/og/generate?title=${encodeURIComponent(project.title)}`
        }
        author={{
          name: sitePerson.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${sitePerson.avatar}`,
        }}
      />
      <Column maxWidth="s" gap="16" horizontal="center" align="center">
        <SmartLink href="/work">
          <Text variant="label-strong-m">Projets</Text>
        </SmartLink>
        {project.publishedAt && (
          <Text
            variant="body-default-xs"
            onBackground="neutral-weak"
            marginBottom="12"
          >
            {formatProjectDate(project.publishedAt)}
          </Text>
        )}
        <Row gap="12" wrap horizontal="center" vertical="center">
          {project.typeProjectTag.length > 0 && (
            <Row gap="8" wrap horizontal="center">
              {project.typeProjectTag.map((tag) => (
                <ProjectTag key={tag} tag={tag} />
              ))}
            </Row>
          )}
          <Heading variant="display-strong-m">{project.title}</Heading>
        </Row>
      </Column>
      <Row horizontal="center">
        {hasMultipleTeamMembers ? (
          <Row fillWidth gap="l" vertical="center">
            <Text
              variant="label-strong-m"
              align="left"
              onBackground="neutral-weak"
            >
              Équipe
            </Text>
            <Column gap="12">
              {project.team.map((member) => {
                const memberLink = member.linkedIn || ownerLinkedIn;
                return (
                  <Row key={member.name} gap="12" vertical="center">
                    {member.avatar ? (
                      <Avatar src={member.avatar} size="m" />
                    ) : (
                      <Icon
                        name="person"
                        size="l"
                        onBackground="neutral-weak"
                      />
                    )}
                    <Row gap="4" wrap vertical="center">
                      {memberLink ? (
                        <SmartLink
                          href={memberLink}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          <Text variant="label-default-m">{member.name}</Text>
                        </SmartLink>
                      ) : (
                        <Text variant="label-default-m">{member.name}</Text>
                      )}
                      {member.role && (
                        <>
                          <Text as="span" onBackground="neutral-weak">
                            |
                          </Text>
                          <Text
                            variant="body-default-xs"
                            onBackground="neutral-weak"
                          >
                            {member.role}
                          </Text>
                        </>
                      )}
                    </Row>
                  </Row>
                );
              })}
            </Column>
          </Row>
        ) : (
          <Row gap="16" vertical="center">
            {avatars.length > 0 && <AvatarGroup avatars={avatars} size="s" />}
            {project.team.length > 0 && (
              <Text variant="label-default-m" onBackground="brand-weak">
                {project.team.map((member, idx) => {
                  const memberLink = member.linkedIn || ownerLinkedIn;
                  return (
                    <span key={`${member.name}-${idx}`}>
                      {idx > 0 && (
                        <Text as="span" onBackground="neutral-weak">
                          ,{" "}
                        </Text>
                      )}
                      {memberLink ? (
                        <SmartLink
                          href={memberLink}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {member.name}
                        </SmartLink>
                      ) : (
                        <Text as="span">{member.name}</Text>
                      )}
                      {!member.avatar && (
                        <Icon
                          name="person"
                          paddingLeft="4"
                          size="s"
                          onBackground="neutral-weak"
                          style={{ display: "inline-flex" }}
                        />
                      )}
                    </span>
                  );
                })}
              </Text>
            )}
          </Row>
        )}
      </Row>
      {(project.link || project.repository) && (
        <Row marginBottom="4" horizontal="center" gap="24" wrap>
          {project.link && (
            <SmartLink
              suffixIcon="arrowUpRightFromSquare"
              style={{ margin: "0", width: "fit-content" }}
              href={project.link}
            >
              <Text variant="body-default-s">Voir le projet</Text>
            </SmartLink>
          )}
          {project.repository && (
            <SmartLink
              suffixIcon="arrowUpRightFromSquare"
              style={{ margin: "0", width: "fit-content" }}
              href={project.repository}
            >
              <Text variant="body-default-s">Voir le code</Text>
            </SmartLink>
          )}
        </Row>
      )}
      {featuredImage && (
        <Media
          priority
          aspectRatio="16 / 9"
          radius="m"
          alt={project.title}
          src={featuredImage}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 720px"
        />
      )}
      <Column style={{ margin: "auto" }} as="article" maxWidth="xs">
        <CustomMDX source={project.content ?? ""} />
      </Column>
      <Column fillWidth gap="40" horizontal="center" marginTop="40">
        <Line maxWidth="40" />
        <Heading as="h2" variant="heading-strong-xl" marginBottom="24">
          Related projects
        </Heading>
        <Projects exclude={[project.slug]} range={[2]} />
      </Column>
      <ScrollToHash />
    </Column>
  );
}
