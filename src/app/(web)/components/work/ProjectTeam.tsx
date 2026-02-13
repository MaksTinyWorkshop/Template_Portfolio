import type { ProjectSummary } from "@/lib/modules/projects";
import contributorStyles from "@/web/components/ui/ProjectCard.module.scss";
import { Avatar, AvatarGroup, Column, Row, SmartLink, Text } from "@once-ui-system/core";
import { MemberContactPopover } from "./MemberContactPopover";
import styles from "./ProjectTeam.module.scss";

interface ProjectTeamProps {
  team: ProjectSummary["team"];
  ownerLinkedIn?: string;
}

const getMemberContactLinks = (member: ProjectSummary["team"][number], ownerLinkedIn?: string) => {
  const socials =
    member.socials
      ?.map((social) => ({
        name: social.name.trim(),
        url: social.url.trim(),
      }))
      .filter((social) => social.name && social.url) ?? [];

  const linkedInUrl = member.linkedIn || (member.isSiteOwner ? ownerLinkedIn : undefined);
  if (linkedInUrl) {
    const hasLinkedIn = socials.some((social) => social.name.toLowerCase() === "linkedin");
    if (!hasLinkedIn) {
      socials.unshift({
        name: "linkedin",
        url: linkedInUrl,
      });
    }
  }

  const hasEmailLink = socials.some((social) => social.url.startsWith("mailto:"));
  if (member.email && !hasEmailLink) {
    socials.push({
      name: "email",
      url: `mailto:${member.email}`,
    });
  }

  return socials;
};

export function ProjectTeam({ team, ownerLinkedIn }: ProjectTeamProps) {
  if (!team.length) return null;

  const avatars = team
    .filter((member): member is typeof member & { avatar: string } => Boolean(member.avatar))
    .map((member) => ({ src: member.avatar }));
  const hasMultipleTeamMembers = team.length > 1;

  return (
    <Row horizontal="center">
      {hasMultipleTeamMembers ? (
        <Row fillWidth gap="l" vertical="center">
          <Text variant="label-strong-m" align="left" onBackground="neutral-weak">
            Équipe
          </Text>
          <Column gap="12">
            {team.map((member, idx) => {
              const memberLink = member.linkedIn || ownerLinkedIn;
              const memberContacts = getMemberContactLinks(member, ownerLinkedIn);
              const hasContacts = memberContacts.length > 0;

              return (
                <Row key={`${member.personId ?? member.name}-${idx}`} gap="12" vertical="center">
                  {member.avatar ? (
                    <Avatar src={member.avatar} size="m" />
                  ) : (
                    <span
                      className={contributorStyles.contributorBubble}
                      title={member.name}
                      aria-label={member.name}
                    >
                      <span className={contributorStyles.contributorInitial}>
                        {member.name.trim().charAt(0).toUpperCase() || "?"}
                      </span>
                    </span>
                  )}
                  <Row gap="4" wrap vertical="center">
                    {hasContacts ? (
                      <MemberContactPopover
                        memberName={member.name}
                        contacts={memberContacts}
                        textVariant="label-default-m"
                      />
                    ) : memberLink ? (
                      <SmartLink href={memberLink} target="_blank" rel="noreferrer noopener">
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
                        <Text variant="body-default-xs" onBackground="neutral-weak">
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
          <Text variant="label-default-m" onBackground="brand-weak">
            {team.map((member, idx) => {
              const memberLink = member.linkedIn || ownerLinkedIn;
              const memberContacts = getMemberContactLinks(member, ownerLinkedIn);
              const hasContacts = memberContacts.length > 0;

              return (
                <span key={`${member.personId ?? member.name}-${idx}`}>
                  {idx > 0 && (
                    <Text as="span" onBackground="neutral-weak">
                      ,{" "}
                    </Text>
                  )}
                  {hasContacts ? (
                    <MemberContactPopover
                      memberName={member.name}
                      contacts={memberContacts}
                      textVariant="body-default-s"
                      inline
                    />
                  ) : memberLink ? (
                    <SmartLink href={memberLink} target="_blank" rel="noreferrer noopener">
                      {member.name}
                    </SmartLink>
                  ) : (
                    <Text as="span">{member.name}</Text>
                  )}
                  {!member.avatar && (
                    <span
                      className={`${contributorStyles.contributorBubble} ${styles.compactFallbackBubble}`}
                      title={member.name}
                      aria-label={member.name}
                    >
                      <span className={contributorStyles.contributorInitial}>
                        {member.name.trim().charAt(0).toUpperCase() || "?"}
                      </span>
                    </span>
                  )}
                </span>
              );
            })}
          </Text>
        </Row>
      )}
    </Row>
  );
}
