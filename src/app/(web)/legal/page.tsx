import { getSitePersonData } from "@/lib/modules/person/services/person-site.service";
import { baseURL } from "@/web/resources";
import {
  Column,
  Heading,
  Meta,
  Schema,
  SmartLink,
  Text,
} from "@once-ui-system/core";

// Force dynamic rendering - disable static generation during build
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return Meta.generate({
    title: "Mentions légales",
    description: "Informations légales du portfolio",
    baseURL: baseURL,
    path: "/legal",
    robots: "noindex, nofollow", // Page légale - pas d'indexation SEO
  });
}

export default async function LegalPage() {
  const sitePerson = await getSitePersonData();

  return (
    <Column maxWidth="m">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title="Mentions légales"
        description="Informations légales du portfolio"
        path="/legal"
        author={{
          name: sitePerson.name,
          url: `${baseURL}/legal`,
          image: `${baseURL}${sitePerson.avatar}`,
        }}
      />

      <Column fillWidth gap="xl" paddingY="l">
        <Heading as="h1" variant="display-strong-l" align="center">
          Mentions légales
        </Heading>

        {/* Hébergeur */}
        <Column fillWidth gap="m">
          <Heading as="h2" variant="display-strong-s">
            Hébergement
          </Heading>
          <Text variant="body-default-m">
            Ce site est hébergé par{" "}
            <SmartLink
              href="https://www.hostinger.fr"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hostinger International Ltd.
            </SmartLink>
          </Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            61 Lordou Vironos Street, 6023 Larnaca, Chypre
          </Text>
        </Column>

        {/* Propriétaire / Éditeur */}
        <Column fillWidth gap="m">
          <Heading as="h2" variant="display-strong-s">
            Éditeur du site
          </Heading>
          <Text variant="body-default-m">
            {sitePerson.name} | Personne physique
          </Text>
        </Column>

        {/* Contact */}
        <Column fillWidth gap="m">
          <Heading as="h2" variant="display-strong-s">
            Contact
          </Heading>
          <Text variant="body-default-m">
            Pour toute question, vous pouvez me contacter via :
          </Text>
          <Column as="ul" gap="8" paddingLeft="24">
            <Text as="li" variant="body-default-m">
              Email :{" "}
              <SmartLink href="mailto:your.email@example.com">
                your.email@example.com
              </SmartLink>
            </Text>
            <Text as="li" variant="body-default-m">
              LinkedIn :{" "}
              <SmartLink
                href="https://www.linkedin.com/in/maxfleury-dinodev/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Max Fleury
              </SmartLink>
            </Text>
            <Text as="li" variant="body-default-m">
              GitHub :{" "}
              <SmartLink
                href="https://github.com/MaksTinyWorkshop"
                target="_blank"
                rel="noopener noreferrer"
              >
                MaksTinyWorkshop
              </SmartLink>
            </Text>
            <Text as="li" variant="body-default-m">
              Malt :{" "}
              <SmartLink
                href="https://www.malt.fr/profile/maximefleury1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Profil Freelance
              </SmartLink>
            </Text>
            <Text as="li" variant="body-default-m">
              WhatsApp :{" "}
              <SmartLink
                href="https://wa.me/33648652868"
                target="_blank"
                rel="noopener noreferrer"
              >
                Message direct
              </SmartLink>
            </Text>
          </Column>
        </Column>

        {/* Propriété intellectuelle */}
        <Column fillWidth gap="m">
          <Heading as="h2" variant="display-strong-s">
            Propriété intellectuelle
          </Heading>
          <Text variant="body-default-m">
            L'ensemble du contenu de ce site (textes, images, designs, code) est
            la propriété exclusive de {sitePerson.name}, sauf mention contraire
            explicite.
          </Text>
          <Text variant="body-default-m">
            Toute reproduction, distribution ou utilisation sans autorisation
            préalable est interdite.
          </Text>
          <Text variant="body-default-s" onBackground="neutral-weak">
            © {new Date().getFullYear()} {sitePerson.name}. Tous droits
            réservés.
          </Text>
        </Column>

        {/* RGPD / Données personnelles */}
        <Column fillWidth gap="m">
          <Heading as="h2" variant="display-strong-s">
            Protection des données personnelles (RGPD)
          </Heading>
          <Text variant="body-default-m">
            Ce site respecte le Règlement Général sur la Protection des Données
            (RGPD) et la loi Informatique et Libertés.
          </Text>

          <Heading as="h3" variant="heading-strong-m" marginTop="s">
            Données collectées
          </Heading>
          <Text variant="body-default-m">
            Ce site ne collecte aucune donnée personnelle automatiquement. Si
            vous me contactez directement (email, réseaux sociaux), vos
            coordonnées sont utilisées uniquement pour répondre à vos demandes
            et ne sont jamais partagées avec des tiers.
          </Text>

          <Heading as="h3" variant="heading-strong-m" marginTop="s">
            Vos droits
          </Heading>
          <Text variant="body-default-m">
            Conformément au RGPD, vous disposez d'un droit d'accès, de
            rectification, de suppression et de portabilité de vos données
            personnelles. Pour exercer ces droits, contactez-moi par email :{" "}
            <SmartLink href="mailto:your.email@example.com">
              your.email@example.com
            </SmartLink>
            .
          </Text>

          <Heading as="h3" variant="heading-strong-m" marginTop="s">
            Cookies
          </Heading>
          <Text variant="body-default-m">
            Ce site n'utilise pas de cookies de tracking ou de publicité. Seuls
            des cookies techniques essentiels au fonctionnement peuvent être
            utilisés.
          </Text>
        </Column>

        {/* Crédits */}
        <Column
          fillWidth
          gap="m"
          marginTop="l"
          paddingTop="l"
          style={{ borderTop: "1px solid var(--neutral-alpha-medium)" }}
        >
          <Heading as="h2" variant="display-strong-s">
            Crédits
          </Heading>
          <Text variant="body-default-m">
            Composants UI :{" "}
            <SmartLink
              href="https://once-ui.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Once UI
            </SmartLink>
          </Text>
        </Column>
      </Column>
    </Column>
  );
}
