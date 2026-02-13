"use client";

import {
  normalizeSocialNetworkKey,
  resolveSocialNetworkLabel,
} from "@/lib/modules/person/domain/social-networks";
import type { IconName } from "@/web/types/content.types";
import { Column, Icon, Row, SmartLink, Text } from "@once-ui-system/core";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./MemberContactPopover.module.scss";

type ContactLink = {
  name: string;
  url: string;
};

const SOCIAL_ICON_MAP: Record<string, IconName> = {
  discord: "discord",
  email: "email",
  facebook: "facebook",
  github: "github",
  instagram: "instagram",
  linkedin: "linkedin",
  malt: "malt",
  pinterest: "pinterest",
  reddit: "reddit",
  telegram: "telegram",
  threads: "threads",
  whatsapp: "whatsapp",
  x: "x",
  youtube: "youtube",
};

const resolveContactIcon = (contact: ContactLink): IconName => {
  const normalizedName = normalizeSocialNetworkKey(contact.name);
  if (normalizedName && SOCIAL_ICON_MAP[normalizedName]) {
    return SOCIAL_ICON_MAP[normalizedName];
  }

  if (contact.url.startsWith("mailto:")) return "email";
  if (contact.url.startsWith("tel:")) return "person";

  return "openLink";
};

const resolveContactLabel = (contact: ContactLink): string => {
  return resolveSocialNetworkLabel(contact.name);
};

interface MemberContactPopoverProps {
  memberName: string;
  contacts: ContactLink[];
  textVariant?: "label-default-m" | "body-default-s";
  inline?: boolean;
}

export function MemberContactPopover({
  memberName,
  contacts,
  textVariant = "label-default-m",
  inline = false,
}: MemberContactPopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const handleOutsidePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsidePointer);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsidePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <span ref={rootRef} className={`${styles.root} ${inline ? styles.rootInline : ""}`}>
      <button
        type="button"
        className={`reset-button-styles focus-ring align-center display-inline-flex g-8 radius-s px-2 mx-2 ${styles.trigger}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <Text as="span" variant={textVariant}>
          {memberName}
        </Text>
      </button>
      {open && (
        <Column
          id={panelId}
          gap="8"
          padding="12"
          background="surface"
          border="neutral-medium"
          radius="m"
          className={styles.panel}
        >
          {contacts.map((contact) => (
            <SmartLink
              key={`${memberName}-${contact.name}-${contact.url}`}
              href={contact.url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => setOpen(false)}
            >
              <Row gap="8" vertical="center">
                <Icon name={resolveContactIcon(contact)} size="s" />
                <Text variant="body-default-s">{resolveContactLabel(contact)}</Text>
              </Row>
            </SmartLink>
          ))}
        </Column>
      )}
    </span>
  );
}
