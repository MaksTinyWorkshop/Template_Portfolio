import { Column, Heading, Text } from "@once-ui-system/core";

export default function NotFound() {
  return (
    <Column as="section" fill center paddingBottom="160">
      <Text marginBottom="s" variant="display-strong-xl">
        404
      </Text>
      <Heading marginBottom="l" variant="display-default-xs">
        Hmmmm... Rien par ici
      </Heading>
      <Text onBackground="neutral-weak">Cette page n'exite pas (encore ?).</Text>
    </Column>
  );
}
