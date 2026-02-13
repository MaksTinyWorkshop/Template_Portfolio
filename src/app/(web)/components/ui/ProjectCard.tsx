"use client";

import type React from "react";
import { Carousel, Column, Flex, Heading, SmartLink, Text } from "@once-ui-system/core";
import styles from "./ProjectCard.module.scss";
import { Tag } from "./Tag";

interface TagData {
  slug: string;
  name: string;
  color?: string | null;
}

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: string[];
  title: string;
  content: string;
  description: string;
  contributors?: Array<{
    name: string;
    avatar?: string | null;
  }>;
  link?: string;
  repository?: string;
  typeProjectTag?: TagData[];
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  href,
  priority = false,
  images = [],
  title,
  content,
  description,
  contributors = [],
  link,
  repository,
  typeProjectTag = [],
}) => {
  const visibleContributors = contributors.slice(0, 5);
  const hiddenContributorsCount = Math.max(0, contributors.length - visibleContributors.length);

  return (
    <Column fillWidth gap="m">
      <div className={styles.carouselWrapper}>
        <Carousel
          aspectRatio="4 / 3"
          sizes="(max-width: 640px) 95vw, (max-width: 768px) 85vw, (max-width: 1024px) 45vw, 400px"
          priority={priority}
          revealedByDefault
          items={images.map((image) => ({
            slide: image,
            alt: title,
          }))}
        />
      </div>
      <Flex
        s={{ direction: "column" }}
        fillWidth
        paddingX="s"
        paddingTop="12"
        paddingBottom="24"
        gap="l"
      >
        {title && (
          <Flex gap="12" wrap vertical="center" flex={5}>
            {typeProjectTag && typeProjectTag.length > 0 && (
              <Flex gap="8" wrap>
                {typeProjectTag.map((tag) => (
                  <Tag key={tag.slug} name={tag.name} color={tag.color} />
                ))}
              </Flex>
            )}
            <Heading as="h2" wrap="balance" variant="heading-strong-xl">
              {title}
            </Heading>
          </Flex>
        )}
        {(contributors.length > 0 || description?.trim() || content?.trim()) && (
          <Column flex={7} gap="16">
            {contributors.length > 0 && (
              <Flex gap="8" vertical="center" wrap>
                <div className={styles.contributorGroup} aria-label="Contributeurs du projet">
                  {visibleContributors.map((contributor, index) => (
                    <div
                      key={`${contributor.name}-${index}`}
                      className={styles.contributorBubble}
                      style={{ zIndex: visibleContributors.length - index }}
                      title={contributor.name}
                      aria-label={contributor.name}
                    >
                      {contributor.avatar ? (
                        <img
                          src={contributor.avatar}
                          alt={contributor.name}
                          className={styles.contributorImage}
                        />
                      ) : (
                        <span className={styles.contributorInitial}>
                          {contributor.name.trim().charAt(0).toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                  ))}
                  {hiddenContributorsCount > 0 && (
                    <div
                      className={styles.contributorMore}
                      title={`${hiddenContributorsCount} contributeur(s) supplémentaire(s)`}
                    >
                      +{hiddenContributorsCount}
                    </div>
                  )}
                </div>
              </Flex>
            )}
            {description?.trim() && (
              <Text wrap="balance" variant="body-default-s" onBackground="neutral-weak">
                {description}
              </Text>
            )}
            <Flex gap="24" wrap>
              {content?.trim() && (
                <SmartLink
                  suffixIcon="arrowRight"
                  style={{ margin: "0", width: "fit-content" }}
                  href={href}
                >
                  <Text variant="body-default-s">Lire l'étude de cas</Text>
                </SmartLink>
              )}
              {link && (
                <SmartLink
                  suffixIcon="arrowUpRightFromSquare"
                  style={{ margin: "0", width: "fit-content" }}
                  href={link}
                >
                  <Text variant="body-default-s">Voir le projet</Text>
                </SmartLink>
              )}
              {repository && (
                <SmartLink
                  suffixIcon="arrowUpRightFromSquare"
                  style={{ margin: "0", width: "fit-content" }}
                  href={repository}
                >
                  <Text variant="body-default-s">Voir le code</Text>
                </SmartLink>
              )}
            </Flex>
          </Column>
        )}
      </Flex>
    </Column>
  );
};
