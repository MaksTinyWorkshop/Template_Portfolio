"use client";

import type { UseFormRegister } from "react-hook-form";
import { Avatar, Button, Card, Flex, Input, Text } from "@once-ui-system/core";
import type { ProjectFormData } from "@/lib/contracts/validations";

export type AvailablePerson = {
  id: string;
  fullName: string;
  pseudo?: string | null;
  role?: string | null;
  email?: string | null;
  avatar?: string | null;
};

interface KnownTeamMemberFieldProps {
  index: number;
  person: AvailablePerson;
  register: UseFormRegister<ProjectFormData>;
  onRemove: () => void;
  errorMessage?: string;
}

export function KnownTeamMemberField({
  index,
  person,
  register,
  onRemove,
  errorMessage,
}: KnownTeamMemberFieldProps) {
  return (
    <Card padding="16" border="neutral-medium">
      <Flex direction="column" gap="12">
        <Flex horizontal="between" vertical="center">
          <Flex gap="12" vertical="center">
            <Avatar src={person.avatar ?? ""} size="m" />
            <Flex direction="column" gap="4">
              <Text variant="heading-strong-m" onBackground="neutral-weak">
                {person.pseudo ?? person.fullName}
              </Text>
              {person.email && (
                <Text variant="body-default-xs" onBackground="neutral-weak">
                  {person.email}
                </Text>
              )}
              <Text variant="body-default-xs" onBackground="neutral-weak">
                Rôle global : {person.role ?? "Inconnu"}
              </Text>
            </Flex>
          </Flex>
          <Button variant="secondary" size="s" type="button" onClick={onRemove}>
            🗑️ Retirer
          </Button>
        </Flex>
        <Input
          id={`team-${index}-role`}
          label="Rôle assigné à ce projet"
          {...register(`team.${index}.role`)}
        />
        {errorMessage && (
          <Text variant="label-default-s" onBackground="danger-weak">
            {errorMessage}
          </Text>
        )}
        <Text variant="body-default-xs" onBackground="neutral-weak">
          Seul ce rôle s’applique à ce projet ; les autres informations restent inchangées sur la
          fiche globale.
        </Text>
      </Flex>
    </Card>
  );
}
