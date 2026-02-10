"use client";

import type React from "react";
import {
  AvatarGroup,
  Carousel,
  Column,
  Flex,
  Heading,
  SmartLink,
  Text,
} from "@once-ui-system/core";
import styles from "./ProjectCard.module.scss";
import { ProjectTag } from "./ProjectTag";

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: string[];
  title: string;
  content: string;
  description: string;
  avatars: { src: string }[];
  link?: string;
  repository?: string;
  typeProjectTag?: string[];
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  href,
  priority = false,
  images = [],
  title,
  content,
  description,
  avatars,
  link,
  repository,
  typeProjectTag = [],
}) => {
  return (
    <Column fillWidth gap="m">
      <div className={styles.carouselWrapper}>
        <Carousel
          aspectRatio="4 / 3"
          sizes="(max-width: 640px) 95vw, (max-width: 768px) 85vw, (max-width: 1024px) 45vw, 400px"
          priority={priority}
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
                  <ProjectTag key={tag} tag={tag} />
                ))}
              </Flex>
            )}
            <Heading as="h2" wrap="balance" variant="heading-strong-xl">
              {title}
            </Heading>
          </Flex>
        )}
        {(avatars?.length > 0 || description?.trim() || content?.trim()) && (
          <Column flex={7} gap="16">
            {avatars?.length > 0 && <AvatarGroup avatars={avatars} size="m" reverse />}
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
