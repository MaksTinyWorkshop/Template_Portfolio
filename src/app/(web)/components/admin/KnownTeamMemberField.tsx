"use client";

import type { UseFormRegister } from "react-hook-form";
import { Avatar, Button, Card, Flex, Input, Text } from "@once-ui-system/core";
import type { ProjectFormData } from "@/lib/contracts/validations";

export type AvailablePerson = {
  id: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
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
  const resolvedDisplayName = (person.pseudo ?? person.fullName ?? "").trim();

  return (
    <Card padding="16" border="neutral-medium">
      <Flex direction="column" gap="12">
        {/* Keep immutable identity fields registered so they are always part of payload */}
        <input type="hidden" {...register(`team.${index}.personId`)} value={person.id} readOnly />
        <input
          type="hidden"
          {...register(`team.${index}.name`)}
          value={resolvedDisplayName}
          readOnly
        />
        <input
          type="hidden"
          {...register(`team.${index}.pseudo`)}
          value={person.pseudo ?? ""}
          readOnly
        />
        <input
          type="hidden"
          {...register(`team.${index}.firstName`)}
          value={person.firstName ?? ""}
          readOnly
        />
        <input
          type="hidden"
          {...register(`team.${index}.lastName`)}
          value={person.lastName ?? ""}
          readOnly
        />
        <input
          type="hidden"
          {...register(`team.${index}.email`)}
          value={person.email ?? ""}
          readOnly
        />
        <input
          type="hidden"
          {...register(`team.${index}.avatar`)}
          value={person.avatar ?? ""}
          readOnly
        />

        <Flex horizontal="between" vertical="center">
          <Flex gap="12" vertical="center">
            <Avatar src={person.avatar ?? ""} size="m" />
            <Flex direction="column" gap="4">
              <Text variant="heading-strong-m" onBackground="neutral-weak">
                {resolvedDisplayName}
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
