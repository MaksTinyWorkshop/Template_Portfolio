import type { PersonSiteData } from "@/lib/modules/person/domain/person.utils";
import { IconButton, Row, SmartLink, Text } from "@once-ui-system/core";
import styles from "./Footer.module.scss";

type FooterProps = {
  sitePerson: PersonSiteData;
};

export const Footer = ({ sitePerson }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <Row
      as="footer"
      fillWidth
      padding="8"
      horizontal="center"
      s={{ direction: "column" }}
    >
      <Row
        className={styles.mobile}
        maxWidth="m"
        paddingY="8"
        paddingX="16"
        gap="16"
        horizontal="between"
        vertical="center"
        s={{
          direction: "column",
          horizontal: "center",
          align: "center",
        }}
      >
        <Row gap="16">
          {sitePerson.socials.map(
            (item) =>
              item.url && (
                <IconButton
                  key={item.name}
                  href={item.url}
                  icon={item.icon ?? "person"}
                  tooltip={item.name}
                  size="s"
                  variant="ghost"
                />
              ),
          )}
        </Row>
        <Text variant="body-default-s" onBackground="neutral-strong">
          <Text onBackground="neutral-weak">© {currentYear} /</Text>
          <Text paddingX="4">{sitePerson.name}</Text>
          <Text onBackground="neutral-weak">
            / <SmartLink href="/legal">Mentions légales</SmartLink>
          </Text>
        </Text>
      </Row>
      <Row height="80" hide s={{ hide: false }} />
    </Row>
  );
};
